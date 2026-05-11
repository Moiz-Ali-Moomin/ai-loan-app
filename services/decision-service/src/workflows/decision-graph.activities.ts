/**
 * Temporal activities for the DecisionGraphWorkflow.
 *
 * Each activity is a plain async function. Temporal serializes inputs/outputs
 * via JSON, so all types must be plain serializable objects.
 */
import { Context } from '@temporalio/activity';
import { createLogger } from '@loan-platform/logger';
import { KafkaTopic } from '@loan-platform/shared-types';
import type { FinalDecision, TraceEntry, DecisionNodeType, NodeExecutionStatus } from '../common/types.js';

const logger = createLogger('decision-service:activities');

// ─── Interfaces (passed by the workflow as plain JSON) ─────────────────────────

export interface FlowSnapshot {
  id: string;
  flowId: string;
  version: string;
  entryNodeId: string;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    config: Record<string, unknown>;
    nextNodeId?: string;
    fallbackNodeId?: string;
    branches: Array<{ condition: string; nodeId: string }>;
    timeoutMs: number;
    retryAttempts: number;
    retryDelayMs: number;
  }>;
  checksum: string;
}

export interface NodeActivityInput {
  node: FlowSnapshot['nodes'][0];
  executionId: string;
  tenantId: string;
  applicationId?: string;
  correlationId: string;
  riskScore: number;
  confidence: number;
  finalDecision: FinalDecision;
  nodeOutputs: Record<string, unknown>;
  input: Record<string, unknown>;
}

export interface NodeActivityOutput {
  traceEntry: TraceEntry;
  output: Record<string, unknown>;
  nextNodeId?: string;
  riskScore?: number;
  confidence?: number;
  finalDecision?: FinalDecision;
  explanation?: Record<string, unknown>;
}

// These are resolved at runtime by the NestJS DI container via the worker bootstrap
let _graphEngine: import('../engine/graph-engine.js').GraphEngine;
let _flowRepository: import('../repositories/flow.repository.js').FlowRepository;
let _executionRepository: import('../repositories/execution.repository.js').ExecutionRepository;
let _approvalRepository: import('../repositories/approval.repository.js').ApprovalRepository;
let _auditClient: import('../audit/audit-client.js').AuditClient;
let _kafkaProducer: import('@loan-platform/kafka').KafkaProducerClient;
let _nodeExecutor: import('../engine/node-executor.js').NodeExecutor;

export function injectActivityDependencies(deps: {
  graphEngine: import('../engine/graph-engine.js').GraphEngine;
  flowRepository: import('../repositories/flow.repository.js').FlowRepository;
  executionRepository: import('../repositories/execution.repository.js').ExecutionRepository;
  approvalRepository: import('../repositories/approval.repository.js').ApprovalRepository;
  auditClient: import('../audit/audit-client.js').AuditClient;
  kafkaProducer: import('@loan-platform/kafka').KafkaProducerClient;
  nodeExecutor: import('../engine/node-executor.js').NodeExecutor;
}): void {
  _graphEngine = deps.graphEngine;
  _flowRepository = deps.flowRepository;
  _executionRepository = deps.executionRepository;
  _approvalRepository = deps.approvalRepository;
  _auditClient = deps.auditClient;
  _kafkaProducer = deps.kafkaProducer;
  _nodeExecutor = deps.nodeExecutor;
}

// ─── Activity implementations ──────────────────────────────────────────────────

export const DecisionGraphActivities = {

  async loadFlowSnapshot(input: {
    flowId: string;
    flowSnapshotId?: string;
    tenantId: string;
  }): Promise<FlowSnapshot> {
    Context.current().heartbeat();
    const snapshot = input.flowSnapshotId
      ? await _flowRepository.findSnapshotById(input.flowSnapshotId, input.tenantId)
      : await _flowRepository.findLatestSnapshot(input.flowId, input.tenantId);

    if (!snapshot) {
      throw new Error(`FlowNotFoundError: No snapshot for flow ${input.flowId}`);
    }
    return snapshot;
  },

  async persistExecutionStarted(input: {
    executionId: string;
    temporalWorkflowId: string;
    temporalRunId: string;
    tenantId: string;
  }): Promise<void> {
    await _executionRepository.markStarted(input.executionId, {
      temporalWorkflowId: input.temporalWorkflowId,
      temporalRunId: input.temporalRunId,
    });
  },

  async executeGraphNode(input: NodeActivityInput): Promise<NodeActivityOutput> {
    Context.current().heartbeat();
    const start = Date.now();

    // Reconstruct a lightweight DecisionNode for the NodeExecutor
    const { DecisionNode } = await import('../domain/decision-flow.entity.js');
    const { ExecutionContext } = await import('../common/types.js');

    const node = new DecisionNode({
      id: input.node.id,
      flowId: '',
      tenantId: input.tenantId,
      name: input.node.name,
      type: input.node.type as DecisionNodeType,
      config: input.node.config,
      nextNodeId: input.node.nextNodeId,
      fallbackNodeId: input.node.fallbackNodeId,
      branches: input.node.branches,
      timeoutMs: input.node.timeoutMs,
      retryAttempts: input.node.retryAttempts,
      retryDelayMs: input.node.retryDelayMs,
      positionX: 0,
      positionY: 0,
    });

    const ctx = {
      executionId: input.executionId,
      tenantId: input.tenantId,
      flowId: '',
      applicationId: input.applicationId,
      correlationId: input.correlationId,
      traceId: Context.current().info.workflowExecution.workflowId,
      input: input.input,
      nodeOutputs: input.nodeOutputs,
      riskScore: input.riskScore,
      confidence: input.confidence,
      finalDecision: input.finalDecision,
      initiatedByType: 'WORKFLOW' as const,
      startedAt: new Date().toISOString(),
    };

    const result = await _nodeExecutor.execute(node, ctx, ctx.traceId);
    const traceEntry = _nodeExecutor.buildTraceEntry(node, result, new Date(Date.now() - result.durationMs));

    // Extract scalar outputs
    let riskScore: number | undefined;
    let confidence: number | undefined;
    let finalDecision: FinalDecision | undefined;

    if (input.node.type === 'AI') {
      riskScore = result.output['riskScore'] as number | undefined;
      confidence = result.output['confidence'] as number | undefined;
      if (result.output['recommendation'] === 'REJECT') finalDecision = 'REJECT';
      if (result.output['recommendation'] === 'MANUAL_REVIEW') finalDecision = 'MANUAL_REVIEW';
    }
    if (input.node.type === 'SCORE') {
      finalDecision = result.output['decision'] as FinalDecision | undefined;
    }
    if (input.node.type === 'RULE' && result.output['hardBlock'] === true) {
      finalDecision = 'REJECT';
    }

    return {
      traceEntry,
      output: result.output,
      nextNodeId: result.nextNodeId,
      riskScore,
      confidence,
      finalDecision,
    };
  },

  async createApprovalRequest(input: {
    tenantId: string;
    executionId: string;
    nodeId: string;
    applicationId?: string;
    assignedRole?: string;
    priority?: string;
    contextSnapshot: Record<string, unknown>;
    dueDurationMs: number;
    escalateAfterMs?: number;
    temporalWorkflowId: string;
    temporalSignalName: string;
  }): Promise<string> {
    const { ApprovalRequest } = await import('../domain/approval-request.entity.js');
    const { ApprovalPriority } = await import('../common/types.js');

    const approval = ApprovalRequest.create({
      tenantId: input.tenantId,
      executionId: input.executionId,
      nodeId: input.nodeId,
      applicationId: input.applicationId,
      assignedRole: input.assignedRole,
      priority: (input.priority as ApprovalPriority) ?? ApprovalPriority.NORMAL,
      contextSnapshot: input.contextSnapshot,
      dueDurationMs: input.dueDurationMs,
      escalateAfterMs: input.escalateAfterMs,
      temporalWorkflowId: input.temporalWorkflowId,
      temporalSignalName: input.temporalSignalName,
    });

    await _approvalRepository.save(approval);
    logger.info('Approval request created', { approvalId: approval.id, executionId: input.executionId });
    return approval.id;
  },

  async persistApprovalCreated(input: {
    approvalId: string;
    executionId: string;
    tenantId: string;
  }): Promise<void> {
    await _executionRepository.markAwaitingApproval(input.executionId);
  },

  async sendApprovalNotification(input: {
    approvalId: string;
    assignedRole?: string;
    tenantId: string;
    executionId: string;
  }): Promise<void> {
    // Emit Kafka event so downstream consumers (email, Slack) can notify reviewers
    await _kafkaProducer.publish(
      KafkaTopic.APPROVAL_REQUESTED,
      'APPROVAL_REQUESTED',
      {
        approvalId: input.approvalId,
        executionId: input.executionId,
        tenantId: input.tenantId,
        assignedRole: input.assignedRole,
        requestedAt: new Date().toISOString(),
      },
      {
        tenantId: input.tenantId,
        correlationId: input.executionId,
        source: 'decision-service',
        key: input.executionId,
      }
    ).catch(err => logger.error('Failed to publish approval notification', { err }));
  },

  async persistExecutionCompleted(input: {
    executionId: string;
    tenantId: string;
    finalDecision: FinalDecision;
    riskScore: number;
    confidence: number;
    explanation: Record<string, unknown>;
    trace: TraceEntry[];
    processingMs: number;
  }): Promise<void> {
    await _executionRepository.markCompleted(input.executionId, {
      finalDecision: input.finalDecision,
      riskScore: input.riskScore,
      confidence: input.confidence,
      explanation: input.explanation,
      executionTrace: input.trace,
      processingMs: input.processingMs,
    });
  },

  async persistExecutionFailed(input: {
    executionId: string;
    tenantId: string;
    error: string;
    processingMs: number;
  }): Promise<void> {
    await _executionRepository.markFailed(input.executionId, input.error, input.processingMs);
  },

  async emitAuditEvent(input: {
    tenantId: string;
    executionId: string;
    applicationId?: string;
    finalDecision: FinalDecision;
    riskScore: number;
    confidence: number;
    correlationId: string;
  }): Promise<void> {
    await _auditClient.emit({
      tenantId: input.tenantId,
      loanRequestId: input.applicationId ?? input.executionId,
      eventType: `GRAPH_DECISION_${input.finalDecision}`,
      actorType: 'SERVICE',
      actorId: 'decision-service',
      serviceName: 'decision-service',
      payload: {
        executionId: input.executionId,
        finalDecision: input.finalDecision,
        riskScore: input.riskScore,
        confidence: input.confidence,
      },
      metadata: {
        traceId: input.executionId,
        correlationId: input.correlationId,
        version: '1.0',
        environment: process.env['NODE_ENV'] ?? 'production',
      },
    }).catch(err => logger.error('Failed to emit audit event', { err, executionId: input.executionId }));
  },

  async publishDecisionEvent(input: {
    executionId: string;
    flowId: string;
    tenantId: string;
    applicationId?: string;
    finalDecision: FinalDecision;
    riskScore: number;
    confidence: number;
    correlationId: string;
    processingMs: number;
    completedAt: string;
  }): Promise<void> {
    const topic = input.finalDecision === 'REJECT'
      ? KafkaTopic.DECISION_FAILED
      : KafkaTopic.DECISION_COMPLETED;

    await _kafkaProducer.publish(
      topic,
      `DECISION_${input.finalDecision}`,
      {
        executionId: input.executionId,
        flowId: input.flowId,
        applicationId: input.applicationId,
        finalDecision: input.finalDecision,
        riskScore: input.riskScore,
        confidence: input.confidence,
        processingMs: input.processingMs,
        completedAt: input.completedAt,
      },
      {
        tenantId: input.tenantId,
        correlationId: input.correlationId,
        source: 'decision-service',
        key: input.applicationId ?? input.executionId,
      }
    ).catch(err =>
      logger.error('Failed to publish decision event', { err, executionId: input.executionId })
    );
  },
};

export type DecisionGraphActivities = typeof DecisionGraphActivities;
