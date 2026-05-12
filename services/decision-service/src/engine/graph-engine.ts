import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { DecisionFlow } from '../domain/decision-flow.entity.js';
import { DecisionExecution } from '../domain/decision-execution.entity.js';
import {
  DecisionNodeType,
  NodeExecutionStatus,
  type ExecutionContext,
  type FinalDecision,
} from '../common/types.js';
import {
  FlowNotFoundError,
  FlowNotPublishedError,
} from '../common/errors.js';
import { NodeExecutor } from './node-executor.js';
import {
  graphExecutionsTotal,
  graphNodeExecutionDuration,
  graphExecutionDuration,
  approvalGatesTotal,
} from '../utils/engine-metrics.js';

const logger = createLogger('decision-service:graph-engine');

export interface GraphExecutionResult {
  executionId: string;
  finalDecision: FinalDecision;
  riskScore: number;
  confidence: number;
  explanation: Record<string, unknown>;
  trace: import('../common/types.js').TraceEntry[];
  requiresApproval: boolean;
  approvalNodeId?: string;
  processingMs: number;
}

@Injectable()
export class GraphEngine {
  constructor(private readonly nodeExecutor: NodeExecutor) {}

  async execute(
    flow: DecisionFlow,
    execution: DecisionExecution,
    traceId: string,
  ): Promise<GraphExecutionResult> {
    if (!flow.isPublished()) throw new FlowNotPublishedError(flow.id);

    const start = Date.now();
    const correlationId = execution.correlationId;

    logger.info('Graph execution started', {
      executionId: execution.id, flowId: flow.id, tenantId: execution.tenantId, traceId,
    });

    return withSpan(
      'decision-service',
      'graph:execute',
      { executionId: execution.id, flowId: flow.id, tenantId: execution.tenantId },
      async () => {
        // Build initial execution context
        const ctx: ExecutionContext = {
          executionId: execution.id,
          tenantId: execution.tenantId,
          flowId: flow.id,
          applicationId: execution.applicationId,
          workflowRunId: execution.workflowRunId,
          correlationId,
          traceId,
          input: execution.input,
          nodeOutputs: {},
          initiatedBy: execution.initiatedBy,
          initiatedByType: execution.initiatedByType,
          startedAt: new Date().toISOString(),
        };

        const entryNode = flow.entryNode();
        if (!entryNode) throw new FlowNotFoundError(flow.id);

        let currentNodeId: string | undefined = entryNode.id;
        const visitedNodes = new Set<string>();
        const maxHops = flow.nodes.length * 2; // guard against infinite loops
        let hops = 0;

        while (currentNodeId && hops < maxHops) {
          const node = flow.nodeById(currentNodeId);
          if (!node) {
            logger.error('Node not found in flow', { nodeId: currentNodeId, flowId: flow.id });
            break;
          }

          // Cycle detection
          if (visitedNodes.has(currentNodeId)) {
            logger.error('Cycle detected in decision graph', { nodeId: currentNodeId });
            break;
          }
          visitedNodes.add(currentNodeId);
          hops++;

          // Approval / human-review nodes pause execution — caller handles signal
          if (node.requiresApproval()) {
            approvalGatesTotal.add(1, { tenantId: ctx.tenantId, nodeType: node.type });
            const processingMs = Date.now() - start;
            return {
              executionId: execution.id,
              finalDecision: ctx.finalDecision ?? 'MANUAL_REVIEW',
              riskScore: ctx.riskScore ?? 0.5,
              confidence: ctx.confidence ?? 0.5,
              explanation: this.buildExplanation(ctx, execution.executionTrace),
              trace: execution.executionTrace,
              requiresApproval: true,
              approvalNodeId: currentNodeId,
              processingMs,
            };
          }

          // Terminal node
          if (node.isTerminal()) {
            const nodeStart = new Date();
            const result = await this.nodeExecutor.execute(node, ctx, traceId);
            const traceEntry = this.nodeExecutor.buildTraceEntry(node, result, nodeStart);
            execution.appendTrace(traceEntry);

            graphNodeExecutionDuration.record(result.durationMs, {
              nodeType: node.type,
              status: result.status,
            });
            break;
          }

          // Execute the node
          const nodeStart = new Date();
          let result: Awaited<ReturnType<NodeExecutor['execute']>>;

          try {
            result = await this.nodeExecutor.execute(node, ctx, traceId);
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const traceEntry = {
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
              status: NodeExecutionStatus.FAILED,
              durationMs: Date.now() - nodeStart.getTime(),
              startedAt: nodeStart.toISOString(),
              completedAt: new Date().toISOString(),
              error: error.message,
              retryCount: 0,
            };
            execution.appendTrace(traceEntry);

            if (node.fallbackNodeId) {
              logger.warn('Node failed, using fallback', { nodeId: node.id, fallbackNodeId: node.fallbackNodeId });
              currentNodeId = node.fallbackNodeId;
              continue;
            }
            throw err;
          }

          const traceEntry = this.nodeExecutor.buildTraceEntry(node, result, nodeStart);
          execution.appendTrace(traceEntry);

          graphNodeExecutionDuration.record(result.durationMs, {
            nodeType: node.type,
            status: result.status,
          });

          // Merge node output into context
          ctx.nodeOutputs[node.id] = result.output;
          this.mergeOutputIntoContext(node.type, result.output, ctx);

          currentNodeId = result.nextNodeId;
        }

        const processingMs = Date.now() - start;
        const finalDecision = ctx.finalDecision ?? this.inferDecision(ctx);
        const riskScore = ctx.riskScore ?? 0;
        const confidence = ctx.confidence ?? 0;

        graphExecutionsTotal.add(1, {
          tenantId: ctx.tenantId,
          decision: finalDecision,
          flowId: flow.id,
        });
        graphExecutionDuration.record(processingMs, { flowId: flow.id, decision: finalDecision });

        logger.info('Graph execution completed', {
          executionId: execution.id, finalDecision, riskScore, confidence, processingMs, hops,
        });

        return {
          executionId: execution.id,
          finalDecision,
          riskScore,
          confidence,
          explanation: this.buildExplanation(ctx, execution.executionTrace),
          trace: execution.executionTrace,
          requiresApproval: false,
          processingMs,
        };
      }
    );
  }

  private mergeOutputIntoContext(
    nodeType: DecisionNodeType,
    output: Record<string, unknown>,
    ctx: ExecutionContext,
  ): void {
    switch (nodeType) {
      case DecisionNodeType.AI:
        if (typeof output['riskScore'] === 'number') ctx.riskScore = output['riskScore'];
        if (typeof output['confidence'] === 'number') ctx.confidence = output['confidence'];
        if (output['recommendation'] === 'REJECT') ctx.finalDecision = 'REJECT';
        if (output['recommendation'] === 'MANUAL_REVIEW') ctx.finalDecision = 'MANUAL_REVIEW';
        break;

      case DecisionNodeType.RULE:
        if (output['hardBlock'] === true) {
          ctx.finalDecision = 'REJECT';
          ctx.escalationReasons = [...(ctx.escalationReasons ?? []), 'HARD_POLICY_VIOLATION'];
        }
        if (!ctx.policyOutcomes) ctx.policyOutcomes = [];
        (ctx.policyOutcomes as unknown[]).push(output);
        break;

      case DecisionNodeType.SCORE:
        if (typeof output['decision'] === 'string') {
          ctx.finalDecision = output['decision'] as FinalDecision;
        }
        break;

      case DecisionNodeType.CONDITION:
        // Condition nodes affect routing only, not context state
        break;

      default:
        break;
    }
  }

  private inferDecision(ctx: ExecutionContext): FinalDecision {
    if (!ctx.riskScore) return 'MANUAL_REVIEW';
    if (ctx.riskScore >= 0.85) return 'REJECT';
    if (ctx.riskScore <= 0.35 && (ctx.confidence ?? 0) >= 0.75) return 'APPROVE';
    return 'MANUAL_REVIEW';
  }

  private buildExplanation(
    ctx: ExecutionContext,
    trace: import('../common/types.js').TraceEntry[],
  ): Record<string, unknown> {
    const failedNodes = trace.filter(t => t.status === NodeExecutionStatus.FAILED);
    const policyOutcomes = ctx.policyOutcomes ?? [];

    return {
      summary: this.buildSummary(ctx, failedNodes),
      riskScore: ctx.riskScore,
      confidence: ctx.confidence,
      finalDecision: ctx.finalDecision,
      nodeCount: trace.length,
      failedNodes: failedNodes.map(n => ({ nodeId: n.nodeId, error: n.error })),
      policyOutcomes,
      escalationReasons: ctx.escalationReasons ?? [],
      decisionLogic: `Traversed ${trace.length} node(s). ` +
        `Risk: ${(ctx.riskScore ?? 0).toFixed(3)}, ` +
        `Confidence: ${(ctx.confidence ?? 0).toFixed(3)}. ` +
        `Final: ${ctx.finalDecision ?? 'MANUAL_REVIEW'}.`,
    };
  }

  private buildSummary(
    ctx: ExecutionContext,
    failedNodes: import('../common/types.js').TraceEntry[],
  ): string {
    const decision = ctx.finalDecision ?? 'MANUAL_REVIEW';
    const risk = ctx.riskScore ?? 0;
    const reasons = ctx.escalationReasons ?? [];

    if (decision === 'APPROVE') {
      return `Application approved. Risk score ${risk.toFixed(3)} within acceptable threshold.`;
    }
    if (decision === 'REJECT') {
      return `Application rejected. ${reasons.join(', ') || 'Policy hard block or high risk score'}.`;
    }
    if (decision === 'ESCALATE') {
      return `Escalated to specialist. Triggers: ${reasons.join(', ')}.`;
    }
    return `Referred for manual review. ${reasons.length > 0 ? 'Triggers: ' + reasons.join(', ') : failedNodes.length > 0 ? `${failedNodes.length} node(s) failed.` : 'Insufficient confidence for automated decision.'}`;
  }
}
