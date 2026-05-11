/**
 * Temporal workflow: DecisionGraphWorkflow
 *
 * Orchestrates execution of a decision flow graph with:
 *  - full node-by-node traversal via activities
 *  - human approval gates (pause → signal → resume)
 *  - timeout handling per node and per workflow
 *  - compensation on failure
 *  - idempotency (Temporal guarantees exactly-once workflow execution)
 */
import {
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  proxyActivities,
  sleep,
  startChild,
  workflowInfo,
  log,
  ApplicationFailure,
} from '@temporalio/workflow';
import type { DecisionGraphActivities } from './decision-graph.activities.js';
import type { FinalDecision, TraceEntry } from '../common/types.js';

// ─── Signal & Query definitions ────────────────────────────────────────────────

export interface ApprovalSignalPayload {
  approvalId: string;
  decision: 'APPROVE' | 'REJECT' | 'DELEGATE';
  decidedBy: string;
  notes?: string;
}

export const approvalSignal = defineSignal<[ApprovalSignalPayload]>('approval.decision');
export const cancelSignal = defineSignal<[{ reason: string }]>('execution.cancel');
export const pauseSignal = defineSignal('execution.pause');
export const resumeSignal = defineSignal('execution.resume');

export const executionStatusQuery = defineQuery<string>('execution.status');
export const executionTraceQuery = defineQuery<TraceEntry[]>('execution.trace');

// ─── Workflow input/output ──────────────────────────────────────────────────────

export interface DecisionGraphWorkflowInput {
  executionId: string;
  flowId: string;
  flowSnapshotId?: string;
  tenantId: string;
  applicationId?: string;
  workflowRunId?: string;
  input: Record<string, unknown>;
  correlationId: string;
  initiatedBy?: string;
  initiatedByType: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'API';
  timeoutMs?: number;
}

export interface DecisionGraphWorkflowOutput {
  executionId: string;
  finalDecision: FinalDecision;
  riskScore: number;
  confidence: number;
  explanation: Record<string, unknown>;
  trace: TraceEntry[];
  processingMs: number;
  completedAt: string;
}

// ─── Activity proxy ─────────────────────────────────────────────────────────────

const {
  loadFlowSnapshot,
  persistExecutionStarted,
  executeGraphNode,
  createApprovalRequest,
  persistApprovalCreated,
  persistExecutionCompleted,
  persistExecutionFailed,
  publishDecisionEvent,
  emitAuditEvent,
  sendApprovalNotification,
} = proxyActivities<DecisionGraphActivities>({
  startToCloseTimeout: '2 minutes',
  scheduleToCloseTimeout: '10 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '30s',
    nonRetryableErrorTypes: [
      'FlowNotFoundError',
      'FlowNotPublishedError',
      'TenantIsolationError',
      'ValidationError',
    ],
  },
});

// ─── Main Workflow ──────────────────────────────────────────────────────────────

export async function DecisionGraphWorkflow(
  input: DecisionGraphWorkflowInput,
): Promise<DecisionGraphWorkflowOutput> {
  const workflowStart = Date.now();
  const { workflowId, runId } = workflowInfo();

  let status = 'RUNNING';
  let trace: TraceEntry[] = [];
  let approvalPending = false;
  let approvalResolved: ApprovalSignalPayload | null = null;
  let cancelled = false;
  let paused = false;

  // ── Signal handlers ────────────────────────────────────────────────────────
  setHandler(approvalSignal, (payload: ApprovalSignalPayload) => {
    approvalResolved = payload;
    approvalPending = false;
  });

  setHandler(cancelSignal, ({ reason }: { reason: string }) => {
    cancelled = true;
    log.warn('Execution cancelled via signal', { reason, executionId: input.executionId });
  });

  setHandler(pauseSignal, () => {
    paused = true;
    status = 'PAUSED';
  });

  setHandler(resumeSignal, () => {
    paused = false;
    status = 'RUNNING';
  });

  // ── Query handlers ─────────────────────────────────────────────────────────
  setHandler(executionStatusQuery, () => status);
  setHandler(executionTraceQuery, () => trace);

  try {
    // 1. Load the immutable flow snapshot
    const snapshot = await loadFlowSnapshot({
      flowId: input.flowId,
      flowSnapshotId: input.flowSnapshotId,
      tenantId: input.tenantId,
    });

    // 2. Persist execution as RUNNING
    await persistExecutionStarted({
      executionId: input.executionId,
      temporalWorkflowId: workflowId,
      temporalRunId: runId,
      tenantId: input.tenantId,
    });

    // 3. Graph traversal
    let currentNodeId: string | undefined = snapshot.entryNodeId;
    const visitedNodes = new Set<string>();
    const nodeMap = new Map(snapshot.nodes.map((n: { id: string }) => [n.id, n]));
    const maxHops = snapshot.nodes.length * 2;
    let hops = 0;
    let riskScore = 0;
    let confidence = 0;
    let finalDecision: FinalDecision = 'MANUAL_REVIEW';
    let explanation: Record<string, unknown> = {};
    const nodeOutputs: Record<string, unknown> = {};

    while (currentNodeId && hops < maxHops && !cancelled) {
      // Pause gate
      if (paused) {
        await condition(() => !paused, input.timeoutMs ?? 86_400_000);
      }

      const node = nodeMap.get(currentNodeId);
      if (!node) break;

      if (visitedNodes.has(currentNodeId)) {
        log.error('Cycle detected in decision graph', { nodeId: currentNodeId });
        break;
      }
      visitedNodes.add(currentNodeId);
      hops++;

      const isApprovalNode = node.type === 'APPROVAL' || node.type === 'HUMAN_REVIEW';
      const isTerminal = node.type === 'END';

      // ── Approval gate ──────────────────────────────────────────────────────
      if (isApprovalNode) {
        status = 'AWAITING_APPROVAL';
        approvalPending = true;
        approvalResolved = null;

        const cfg = node.config as { assignedRole?: string; dueDurationMs?: number; escalateAfterMs?: number; priority?: string };
        const dueDurationMs = cfg.dueDurationMs ?? 86_400_000; // 24h default

        const approvalId = await createApprovalRequest({
          tenantId: input.tenantId,
          executionId: input.executionId,
          nodeId: node.id,
          applicationId: input.applicationId,
          assignedRole: cfg.assignedRole,
          priority: cfg.priority,
          contextSnapshot: {
            riskScore, confidence, finalDecision,
            nodeOutputs, applicationId: input.applicationId,
          },
          dueDurationMs,
          escalateAfterMs: cfg.escalateAfterMs,
          temporalWorkflowId: workflowId,
          temporalSignalName: 'approval.decision',
        });

        await persistApprovalCreated({ approvalId, executionId: input.executionId, tenantId: input.tenantId });
        await sendApprovalNotification({ approvalId, assignedRole: cfg.assignedRole, tenantId: input.tenantId, executionId: input.executionId });

        // Wait for signal or timeout
        const approved = await condition(() => !approvalPending || cancelled, dueDurationMs);

        if (cancelled) break;

        if (!approved || !approvalResolved) {
          // Timeout — auto-escalate or reject per config
          finalDecision = 'ESCALATE';
          trace.push({
            nodeId: node.id, nodeName: node.name ?? node.type, nodeType: node.type,
            status: 'TIMED_OUT' as never, durationMs: dueDurationMs,
            startedAt: new Date().toISOString(), retryCount: 0,
          });
          break;
        }

        const resolved = approvalResolved;
        trace.push({
          nodeId: node.id, nodeName: node.name ?? node.type, nodeType: node.type,
          status: 'COMPLETED' as never,
          durationMs: Date.now() - workflowStart,
          startedAt: new Date().toISOString(),
          output: { decision: resolved.decision, decidedBy: resolved.decidedBy },
          retryCount: 0,
        });

        if (resolved.decision === 'REJECT') {
          finalDecision = 'REJECT';
          break;
        }

        // APPROVE or DELEGATE → continue to next node
        status = 'RUNNING';
        currentNodeId = node.nextNodeId;
        continue;
      }

      // ── Terminal node ──────────────────────────────────────────────────────
      if (isTerminal) {
        trace.push({
          nodeId: node.id, nodeName: node.name ?? 'END', nodeType: node.type,
          status: 'COMPLETED' as never, durationMs: 0,
          startedAt: new Date().toISOString(), retryCount: 0,
        });
        break;
      }

      // ── Regular node execution via activity ────────────────────────────────
      const nodeResult = await executeGraphNode({
        node,
        executionId: input.executionId,
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        correlationId: input.correlationId,
        riskScore,
        confidence,
        finalDecision,
        nodeOutputs,
        input: input.input,
      });

      trace.push(nodeResult.traceEntry);
      nodeOutputs[node.id] = nodeResult.output;

      // Propagate scalar results
      if (typeof nodeResult.riskScore === 'number') riskScore = nodeResult.riskScore;
      if (typeof nodeResult.confidence === 'number') confidence = nodeResult.confidence;
      if (nodeResult.finalDecision) finalDecision = nodeResult.finalDecision;
      if (nodeResult.explanation) explanation = nodeResult.explanation;

      currentNodeId = nodeResult.nextNodeId;
    }

    const processingMs = Date.now() - workflowStart;

    // 4. Persist completion
    const completedAt = new Date().toISOString();
    await persistExecutionCompleted({
      executionId: input.executionId,
      tenantId: input.tenantId,
      finalDecision,
      riskScore,
      confidence,
      explanation,
      trace,
      processingMs,
    });

    // 5. Emit audit event
    await emitAuditEvent({
      tenantId: input.tenantId,
      executionId: input.executionId,
      applicationId: input.applicationId,
      finalDecision,
      riskScore,
      confidence,
      correlationId: input.correlationId,
    });

    // 6. Publish Kafka event
    await publishDecisionEvent({
      executionId: input.executionId,
      flowId: input.flowId,
      tenantId: input.tenantId,
      applicationId: input.applicationId,
      finalDecision,
      riskScore,
      confidence,
      correlationId: input.correlationId,
      processingMs,
      completedAt,
    });

    status = 'COMPLETED';

    return {
      executionId: input.executionId,
      finalDecision,
      riskScore,
      confidence,
      explanation,
      trace,
      processingMs,
      completedAt,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    status = 'FAILED';

    await persistExecutionFailed({
      executionId: input.executionId,
      tenantId: input.tenantId,
      error: error.message,
      processingMs: Date.now() - workflowStart,
    }).catch(() => {/* non-fatal */});

    throw ApplicationFailure.create({
      message: error.message,
      type: error.constructor.name,
      nonRetryable: error.message.includes('NotFound') || error.message.includes('NotPublished'),
    });
  }
}
