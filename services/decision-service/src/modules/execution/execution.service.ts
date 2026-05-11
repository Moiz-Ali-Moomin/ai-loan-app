import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { Connection, Client as TemporalClient, WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import { DecisionExecution } from '../../domain/decision-execution.entity.js';
import { ExecutionRepository } from '../../repositories/execution.repository.js';
import { FlowRepository } from '../../repositories/flow.repository.js';
import { CacheService } from '../../infrastructure/cache.service.js';
import {
  ExecutionStatus,
} from '../../common/types.js';
import {
  FlowNotFoundError,
  FlowNotPublishedError,
} from '../../common/errors.js';
import {
  type DecisionGraphWorkflowInput,
  type ApprovalSignalPayload,
  approvalSignal,
} from '../../workflows/decision-graph.workflow.js';
import { graphExecutionsTotal } from '../../utils/engine-metrics.js';

const logger = createLogger('decision-service:execution-service');

const TASK_QUEUE = 'decision-graph';
const TEMPORAL_NAMESPACE = process.env['TEMPORAL_NAMESPACE'] ?? 'loan-governance';

export interface ExecuteFlowInput {
  tenantId: string;
  flowId: string;
  flowSnapshotId?: string;
  applicationId?: string;
  workflowRunId?: string;
  input: Record<string, unknown>;
  idempotencyKey?: string;
  correlationId?: string;
  initiatedBy?: string;
  initiatedByType: 'USER' | 'SYSTEM' | 'WORKFLOW' | 'API';
  timeoutMs?: number;
}

@Injectable()
export class ExecutionService {
  private temporalClient: TemporalClient | null = null;

  constructor(
    private readonly executionRepository: ExecutionRepository,
    private readonly flowRepository: FlowRepository,
    private readonly cache: CacheService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const connection = await Connection.connect({
        address: process.env['TEMPORAL_ADDRESS'] ?? 'temporal:7233',
      });
      this.temporalClient = new TemporalClient({ connection, namespace: TEMPORAL_NAMESPACE });
      logger.info('Temporal client connected');
    } catch (err) {
      logger.error('Failed to connect Temporal client', { err });
    }
  }

  async executeFlow(input: ExecuteFlowInput): Promise<{
    executionId: string;
    status: ExecutionStatus;
    workflowId: string;
  }> {
    return withSpan('decision-service', 'execution:start', { tenantId: input.tenantId, flowId: input.flowId }, async () => {
      // Idempotency check
      if (input.idempotencyKey) {
        const existing = await this.executionRepository.findByIdempotencyKey(input.idempotencyKey);
        if (existing) {
          logger.info('Idempotent execution returned', { executionId: existing.id, key: input.idempotencyKey });
          return { executionId: existing.id, status: existing.status as ExecutionStatus, workflowId: existing.id };
        }
      }

      // Validate flow
      const flow = await this.flowRepository.findById(input.flowId, input.tenantId);
      if (!flow) throw new FlowNotFoundError(input.flowId);
      if (!flow.isPublished()) throw new FlowNotPublishedError(input.flowId);

      // Get latest snapshot
      const snapshot = input.flowSnapshotId
        ? await this.flowRepository.findSnapshotById(input.flowSnapshotId, input.tenantId)
        : await this.flowRepository.findLatestSnapshot(input.flowId, input.tenantId);

      const executionId = randomUUID();
      const correlationId = input.correlationId ?? randomUUID();

      // Persist execution record (PENDING)
      const execution = DecisionExecution.create({
        tenantId: input.tenantId,
        flowId: input.flowId,
        flowSnapshotId: snapshot?.id,
        applicationId: input.applicationId,
        workflowRunId: input.workflowRunId,
        input: input.input,
        idempotencyKey: input.idempotencyKey,
        correlationId,
        initiatedBy: input.initiatedBy,
        initiatedByType: input.initiatedByType,
        timeoutAt: input.timeoutMs ? new Date(Date.now() + input.timeoutMs) : undefined,
      });

      // Override the auto-generated UUID to match the one we'll use for Temporal
      Object.defineProperty(execution, 'id', { value: executionId });

      await this.executionRepository.save(execution);

      // Start Temporal workflow
      const workflowInput: DecisionGraphWorkflowInput = {
        executionId,
        flowId: input.flowId,
        flowSnapshotId: snapshot?.id,
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        workflowRunId: input.workflowRunId,
        input: input.input,
        correlationId,
        initiatedBy: input.initiatedBy,
        initiatedByType: input.initiatedByType,
        timeoutMs: input.timeoutMs,
      };

      if (this.temporalClient) {
        try {
          await this.temporalClient.workflow.start('DecisionGraphWorkflow', {
            taskQueue: TASK_QUEUE,
            workflowId: `decision-${executionId}`,
            args: [workflowInput],
            workflowExecutionTimeout: input.timeoutMs ? `${Math.ceil(input.timeoutMs / 1000)}s` : '24h',
            searchAttributes: {
              TenantId: [input.tenantId],
              FlowId: [input.flowId],
            },
          });
        } catch (err) {
          if (!(err instanceof WorkflowExecutionAlreadyStartedError)) {
            logger.error('Failed to start Temporal workflow', { err, executionId });
            await this.executionRepository.markFailed(executionId, String(err), 0);
            throw err;
          }
        }
      } else {
        // Temporal unavailable: mark as failed so caller knows
        logger.error('Temporal client unavailable — execution cannot proceed', { executionId });
        await this.executionRepository.markFailed(executionId, 'Temporal unavailable', 0);
      }

      graphExecutionsTotal.add(1, { tenantId: input.tenantId, flowId: input.flowId, decision: 'PENDING' });

      logger.info('Flow execution started', { executionId, flowId: input.flowId, correlationId });

      return {
        executionId,
        status: ExecutionStatus.RUNNING,
        workflowId: `decision-${executionId}`,
      };
    });
  }

  async getExecution(executionId: string, tenantId: string): Promise<Record<string, unknown>> {
    const cached = await this.cache.getDecision(executionId, tenantId);
    if (cached) return cached as Record<string, unknown>;

    const execution = await this.executionRepository.findById(executionId, tenantId);
    if (!execution) throw new FlowNotFoundError(executionId);

    if ((execution['status'] as string) === 'COMPLETED') {
      await this.cache.setDecision(executionId, tenantId, execution);
    }
    return execution;
  }

  async listExecutions(tenantId: string, opts: {
    status?: ExecutionStatus;
    flowId?: string;
    applicationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: Record<string, unknown>[]; total: number }> {
    return this.executionRepository.findByTenant(tenantId, opts);
  }

  async retryExecution(executionId: string, tenantId: string, retriedBy: string): Promise<{
    newExecutionId: string;
    workflowId: string;
  }> {
    const existing = await this.executionRepository.findById(executionId, tenantId);
    if (!existing) throw new FlowNotFoundError(executionId);

    if (!['FAILED', 'TIMED_OUT'].includes(existing['status'] as string)) {
      throw new Error(`Cannot retry execution in status: ${existing['status']}`);
    }

    const result = await this.executeFlow({
      tenantId,
      flowId: existing['flow_id'] as string,
      flowSnapshotId: existing['flow_snapshot_id'] as string | undefined,
      applicationId: existing['application_id'] as string | undefined,
      workflowRunId: existing['workflow_run_id'] as string | undefined,
      input: existing['input'] as Record<string, unknown>,
      correlationId: existing['correlation_id'] as string,
      initiatedBy: retriedBy,
      initiatedByType: 'USER',
    });
    return { newExecutionId: result.executionId, workflowId: result.workflowId };
  }

  async cancelExecution(executionId: string, tenantId: string, reason: string): Promise<void> {
    if (!this.temporalClient) throw new Error('Temporal client unavailable');

    const workflowId = `decision-${executionId}`;
    const handle = this.temporalClient.workflow.getHandle(workflowId);

    await handle.cancel();
    await this.executionRepository.markFailed(executionId, `Cancelled: ${reason}`, 0);

    logger.info('Execution cancelled', { executionId, reason });
  }

  async sendApprovalSignal(
    executionId: string,
    tenantId: string,
    payload: ApprovalSignalPayload,
  ): Promise<void> {
    if (!this.temporalClient) throw new Error('Temporal client unavailable');

    const workflowId = `decision-${executionId}`;
    const handle = this.temporalClient.workflow.getHandle(workflowId);

    await handle.signal(approvalSignal, payload);
    logger.info('Approval signal sent', { executionId, decision: payload.decision, decidedBy: payload.decidedBy });
  }
}
