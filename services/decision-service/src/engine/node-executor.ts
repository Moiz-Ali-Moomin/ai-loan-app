import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { DecisionNode } from '../domain/decision-flow.entity.js';
import {
  DecisionNodeType,
  NodeExecutionStatus,
  type ExecutionContext,
  type TraceEntry,
  type RuleNodeConfig,
  type ConditionNodeConfig,
  type AINodeConfig,
  type ScoreNodeConfig,
  type WebhookNodeConfig,
  type DelayNodeConfig,
} from '../common/types.js';
import { NodeExecutionError, NodeTimeoutError } from '../common/errors.js';
import { PolicyEvaluator } from '../policies/policy-evaluator.js';
import { AIReasoningClient } from '../reasoning/ai-reasoning-client.js';
import { ConfidenceScorer } from '../scoring/confidence-scorer.js';

const logger = createLogger('decision-service:graph-engine');

export interface NodeExecutionResult {
  nodeId: string;
  status: NodeExecutionStatus;
  output: Record<string, unknown>;
  nextNodeId?: string;
  durationMs: number;
  retryCount: number;
}

// Simple, sandboxed expression evaluator for CONDITION nodes.
// Only allows comparisons on known safe paths — no eval().
function evaluateCondition(expression: string, ctx: ExecutionContext): boolean {
  // Parse expressions like: "output.riskScore > 0.8", "ctx.riskScore >= 0.7",
  // "nodeOutputs.ai-node.recommendation == 'MANUAL_REVIEW'"
  const safeCtx = {
    riskScore: ctx.riskScore ?? 0,
    confidence: ctx.confidence ?? 1,
    finalDecision: ctx.finalDecision,
    nodeOutputs: ctx.nodeOutputs,
    input: ctx.input,
  };

  // Replace known tokens
  const sanitised = expression
    .replace(/ctx\./g, '')
    .replace(/output\./g, '');

  // Guard: only allow alphanumeric, dots, brackets, quotes, comparators, spaces
  if (!/^[\w\s.><=!'"[\]()]+$/.test(sanitised)) {
    logger.warn('Unsafe condition expression blocked', { expression });
    return false;
  }

  try {
    // Using Function instead of eval gives a clean scope
    const fn = new Function(
      ...Object.keys(safeCtx),
      `"use strict"; return (${sanitised});`
    );
    return Boolean(fn(...Object.values(safeCtx)));
  } catch {
    logger.warn('Condition evaluation error, defaulting false', { expression });
    return false;
  }
}

@Injectable()
export class NodeExecutor {
  constructor(
    private readonly policyEvaluator: PolicyEvaluator,
    private readonly aiClient: AIReasoningClient,
    private readonly confidenceScorer: ConfidenceScorer,
  ) {}

  async execute(
    node: DecisionNode,
    ctx: ExecutionContext,
    traceId: string,
  ): Promise<NodeExecutionResult> {
    const start = Date.now();
    let retryCount = 0;
    let lastError: Error | undefined;

    return withSpan(
      'decision-service',
      `graph:node:${node.type}`,
      { nodeId: node.id, nodeType: node.type, tenantId: ctx.tenantId },
      async () => {
        while (retryCount <= node.retryAttempts) {
          try {
            const output = await this.executeWithTimeout(node, ctx, traceId);
            const durationMs = Date.now() - start;

            logger.info('Node executed', {
              nodeId: node.id, nodeType: node.type, durationMs, retryCount,
            });

            return {
              nodeId: node.id,
              status: NodeExecutionStatus.COMPLETED,
              output,
              nextNodeId: this.resolveNextNode(node, output, ctx),
              durationMs,
              retryCount,
            };
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const isTimeout = err instanceof NodeTimeoutError;

            if (isTimeout || retryCount >= node.retryAttempts) break;

            retryCount++;
            logger.warn('Node execution failed, retrying', {
              nodeId: node.id, retryCount, maxRetries: node.retryAttempts, error: lastError.message,
            });
            await new Promise(r => setTimeout(r, node.retryDelayMs * retryCount));
          }
        }

        const durationMs = Date.now() - start;
        const isFallback = node.fallbackNodeId !== undefined;

        if (isFallback) {
          logger.warn('Node failed with fallback', {
            nodeId: node.id, fallbackNodeId: node.fallbackNodeId, error: lastError?.message,
          });
          return {
            nodeId: node.id,
            status: NodeExecutionStatus.FAILED,
            output: { error: lastError?.message, usedFallback: true },
            nextNodeId: node.fallbackNodeId,
            durationMs,
            retryCount,
          };
        }

        throw new NodeExecutionError(
          node.id,
          node.type,
          lastError?.message ?? 'Unknown error',
          retryCount < node.retryAttempts,
        );
      }
    );
  }

  private async executeWithTimeout(
    node: DecisionNode,
    ctx: ExecutionContext,
    traceId: string,
  ): Promise<Record<string, unknown>> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new NodeTimeoutError(node.id, node.timeoutMs)), node.timeoutMs)
    );
    return Promise.race([
      this.executeNode(node, ctx, traceId),
      timeoutPromise,
    ]);
  }

  private async executeNode(
    node: DecisionNode,
    ctx: ExecutionContext,
    traceId: string,
  ): Promise<Record<string, unknown>> {
    switch (node.type) {
      case DecisionNodeType.START:
        return { started: true, timestamp: new Date().toISOString() };

      case DecisionNodeType.END:
        return {
          finalDecision: ctx.finalDecision ?? 'MANUAL_REVIEW',
          riskScore: ctx.riskScore,
          confidence: ctx.confidence,
          completedAt: new Date().toISOString(),
        };

      case DecisionNodeType.RULE:
        return this.executeRuleNode(node, ctx, traceId);

      case DecisionNodeType.CONDITION:
        return this.executeConditionNode(node, ctx);

      case DecisionNodeType.AI:
        return this.executeAINode(node, ctx, traceId);

      case DecisionNodeType.SCORE:
        return this.executeScoreNode(node, ctx, traceId);

      case DecisionNodeType.APPROVAL:
      case DecisionNodeType.HUMAN_REVIEW:
        // Signal to the graph engine that we need to pause for human input.
        // The Temporal workflow handles the actual pause/signal/resume.
        return { requiresApproval: true, nodeId: node.id, nodeType: node.type };

      case DecisionNodeType.ACTION:
        return this.executeActionNode(node, ctx, traceId);

      case DecisionNodeType.WEBHOOK:
        return this.executeWebhookNode(node, ctx, traceId);

      case DecisionNodeType.DELAY:
        return this.executeDelayNode(node);

      default:
        throw new NodeExecutionError(node.id, node.type, 'Unknown node type', false);
    }
  }

  private async executeRuleNode(
    node: DecisionNode,
    ctx: ExecutionContext,
    traceId: string,
  ): Promise<Record<string, unknown>> {
    const cfg = node.config as RuleNodeConfig;

    // Build an OPA-compatible input from the execution context
    const input = this.buildOpaInput(ctx);
    const policyResult = await this.policyEvaluator.evaluateSinglePolicy(
      cfg.policyPath,
      input,
      ctx.applicationId ?? ctx.executionId,
      ctx.tenantId,
      traceId,
    );

    return {
      policyPath: cfg.policyPath,
      passed: policyResult.passed,
      hardBlock: policyResult.hard_block,
      violations: policyResult.violations,
      flags: policyResult.flags,
      decision: policyResult.passed ? 'PASS' : (policyResult.hard_block ? 'HARD_DENY' : 'SOFT_DENY'),
    };
  }

  private executeConditionNode(
    node: DecisionNode,
    ctx: ExecutionContext,
  ): Promise<Record<string, unknown>> {
    const cfg = node.config as ConditionNodeConfig;
    const result = evaluateCondition(cfg.expression, ctx);
    return Promise.resolve({
      expression: cfg.expression,
      result,
      branchTaken: result ? 'true' : 'false',
      selectedNodeId: result ? cfg.trueBranchNodeId : cfg.falseBranchNodeId,
    });
  }

  private async executeAINode(
    node: DecisionNode,
    ctx: ExecutionContext,
    traceId: string,
  ): Promise<Record<string, unknown>> {
    const cfg = node.config as AINodeConfig;
    // Reconstruct a minimal request from context input for AI client compatibility
    const syntheticRequest = this.buildSyntheticRequest(ctx, cfg.decisionType);
    const aiOutput = await this.aiClient.reason(syntheticRequest, '', traceId);

    return {
      requestId: aiOutput.requestId,
      riskScore: aiOutput.riskScore,
      confidence: aiOutput.confidence,
      recommendation: aiOutput.recommendation,
      reasoning: aiOutput.reasoning,
      riskFactors: aiOutput.riskFactors,
      suggestedTerms: aiOutput.suggestedTerms,
      modelVersion: aiOutput.modelVersion,
      tokensUsed: aiOutput.tokensUsed,
      latencyMs: aiOutput.latencyMs,
    };
  }

  private executeScoreNode(
    node: DecisionNode,
    ctx: ExecutionContext,
    _traceId: string,
  ): Promise<Record<string, unknown>> {
    const cfg = node.config as ScoreNodeConfig;
    const riskScore = ctx.riskScore ?? 0;

    let decision: string;
    if (riskScore <= cfg.thresholds.APPROVE) {
      decision = 'APPROVE';
    } else if (riskScore >= cfg.thresholds.REJECT) {
      decision = 'REJECT';
    } else {
      decision = 'MANUAL_REVIEW';
    }

    return Promise.resolve({
      riskScore,
      decision,
      thresholds: cfg.thresholds,
      withinApproveRange: riskScore <= cfg.thresholds.APPROVE,
      withinRejectRange: riskScore >= cfg.thresholds.REJECT,
    });
  }

  private async executeActionNode(
    node: DecisionNode,
    ctx: ExecutionContext,
    _traceId: string,
  ): Promise<Record<string, unknown>> {
    const cfg = node.config as Record<string, unknown>;
    // ACTION nodes perform side-effects defined in config (e.g., send notification)
    logger.info('ACTION node executed', {
      nodeId: node.id, actionType: cfg['actionType'], executionId: ctx.executionId,
    });
    return { actionType: cfg['actionType'], executed: true, executedAt: new Date().toISOString() };
  }

  private async executeWebhookNode(
    node: DecisionNode,
    ctx: ExecutionContext,
    traceId: string,
  ): Promise<Record<string, unknown>> {
    const cfg = node.config as WebhookNodeConfig;
    const resp = await fetch(cfg.url, {
      method: cfg.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trace-id': traceId,
        'x-source': 'decision-service',
        ...(cfg.headers ?? {}),
      },
      body: cfg.method !== 'GET' ? JSON.stringify({ executionId: ctx.executionId, input: ctx.input }) : undefined,
      signal: AbortSignal.timeout(cfg.timeoutMs ?? node.timeoutMs),
    });

    if (!resp.ok) {
      throw new NodeExecutionError(node.id, node.type, `Webhook returned ${resp.status}`, true);
    }
    const body = await resp.json() as Record<string, unknown>;
    return { statusCode: resp.status, body };
  }

  private executeDelayNode(node: DecisionNode): Promise<Record<string, unknown>> {
    const cfg = node.config as DelayNodeConfig;
    return new Promise(resolve =>
      setTimeout(() => resolve({ delayed: true, delayMs: cfg.delayMs }), cfg.delayMs)
    );
  }

  private resolveNextNode(
    node: DecisionNode,
    output: Record<string, unknown>,
    ctx: ExecutionContext,
  ): string | undefined {
    if (node.type === DecisionNodeType.CONDITION) {
      // CONDITION node picks its branch via the output's selectedNodeId
      const selected = output['selectedNodeId'] as string | undefined;
      return selected ?? node.nextNodeId;
    }

    // RULE node: if hard-blocked, use fallback; otherwise continue
    if (node.type === DecisionNodeType.RULE && output['hardBlock'] === true) {
      return node.fallbackNodeId ?? node.nextNodeId;
    }

    // Check dynamic branches
    if (node.branches && node.branches.length > 0) {
      for (const branch of node.branches) {
        if (evaluateCondition(branch.condition, { ...ctx, nodeOutputs: { ...ctx.nodeOutputs, [node.id]: output } })) {
          return branch.nodeId;
        }
      }
    }

    return node.nextNodeId;
  }

  buildTraceEntry(
    node: DecisionNode,
    result: NodeExecutionResult,
    startedAt: Date,
  ): TraceEntry {
    return {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: result.status,
      durationMs: result.durationMs,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      output: result.output,
      retryCount: result.retryCount,
    };
  }

  private buildOpaInput(ctx: ExecutionContext): Record<string, unknown> {
    const inp = ctx.input as Record<string, unknown>;
    const profile = (inp['customer_profile'] ?? inp['applicant'] ?? {}) as Record<string, unknown>;
    const financial = (inp['financial_data'] ?? inp['loan'] ?? {}) as Record<string, unknown>;
    const risk = (inp['risk_inputs'] ?? inp['risk'] ?? {}) as Record<string, unknown>;

    return {
      loan: {
        requestedAmount: financial['requestedAmount'] ?? 0,
        loanType: financial['loanType'] ?? 'PERSONAL',
        termMonths: financial['termMonths'] ?? 12,
        purpose: financial['purpose'] ?? '',
      },
      applicant: {
        creditScore: profile['creditScore'] ?? 0,
        annualIncome: profile['annualIncome'] ?? 0,
        existingDebt: profile['existingDebt'] ?? 0,
        kycVerified: profile['kycVerified'] ?? false,
        employmentStatus: profile['employmentStatus'] ?? 'UNKNOWN',
        age: profile['age'] ?? 0,
      },
      riskScore: risk['amlRiskScore'] ?? ctx.riskScore ?? 0,
      fraudScore: risk['fraudScore'] ?? 0,
      tenantId: ctx.tenantId,
    };
  }

  private buildSyntheticRequest(ctx: ExecutionContext, _decisionType: string): Parameters<AIReasoningClient['reason']>[0] {
    const inp = ctx.input as Record<string, unknown>;
    return {
      tenant_id: ctx.tenantId,
      application_id: ctx.applicationId ?? ctx.executionId,
      correlation_id: ctx.correlationId,
      customer_profile: (inp['customer_profile'] ?? {}) as never,
      financial_data: (inp['financial_data'] ?? { requestedAmount: 0, loanType: 'PERSONAL', termMonths: 12 }) as never,
      risk_inputs: (inp['risk_inputs'] ?? {}) as never,
      documents: [],
      workflow_context: { workflowRunId: ctx.workflowRunId } as never,
    };
  }
}
