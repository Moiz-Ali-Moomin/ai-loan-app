import { Injectable, Inject } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import type { DatabasePool } from '@loan-platform/database';
import { DB_POOL_TOKEN } from './decision.repository.js';
import { DecisionExecution } from '../domain/decision-execution.entity.js';
import { ExecutionStatus, type FinalDecision, type TraceEntry } from '../common/types.js';

const logger = createLogger('decision-service:execution-repository');

@Injectable()
export class ExecutionRepository {
  constructor(@Inject(DB_POOL_TOKEN) private readonly pool: DatabasePool) {}

  async save(execution: DecisionExecution): Promise<void> {
    await this.pool.query(
      `INSERT INTO decision_executions (
         id, tenant_id, flow_id, flow_snapshot_id, application_id, workflow_run_id,
         temporal_workflow_id, temporal_run_id, status, input, output,
         execution_trace, final_decision, risk_score, confidence, explanation,
         idempotency_key, correlation_id, initiated_by, initiated_by_type,
         started_at, completed_at, paused_at, timeout_at, processing_ms, created_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [
        execution.id, execution.tenantId, execution.flowId,
        execution.flowSnapshotId ?? null, execution.applicationId ?? null,
        execution.workflowRunId ?? null,
        execution.temporalWorkflowId ?? null, execution.temporalRunId ?? null,
        execution.status,
        JSON.stringify(execution.input),
        execution.output ? JSON.stringify(execution.output) : null,
        JSON.stringify(execution.executionTrace),
        execution.finalDecision ?? null,
        execution.riskScore ?? null, execution.confidence ?? null,
        execution.explanation ? JSON.stringify(execution.explanation) : null,
        execution.idempotencyKey ?? null,
        execution.correlationId,
        execution.initiatedBy ?? null, execution.initiatedByType,
        execution.startedAt?.toISOString() ?? null,
        execution.completedAt?.toISOString() ?? null,
        execution.pausedAt?.toISOString() ?? null,
        execution.timeoutAt?.toISOString() ?? null,
        execution.processingMs ?? null,
        execution.createdAt.toISOString(),
      ]
    );
    logger.debug('Execution saved', { executionId: execution.id, status: execution.status });
  }

  async markStarted(executionId: string, data: {
    temporalWorkflowId: string;
    temporalRunId: string;
  }): Promise<void> {
    await this.pool.query(
      `UPDATE decision_executions SET
         status = 'RUNNING',
         temporal_workflow_id = $2, temporal_run_id = $3,
         started_at = NOW()
       WHERE id = $1`,
      [executionId, data.temporalWorkflowId, data.temporalRunId]
    );
  }

  async markAwaitingApproval(executionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE decision_executions SET status = 'AWAITING_APPROVAL', paused_at = NOW() WHERE id = $1`,
      [executionId]
    );
  }

  async markCompleted(executionId: string, data: {
    finalDecision: FinalDecision;
    riskScore: number;
    confidence: number;
    explanation: Record<string, unknown>;
    executionTrace: TraceEntry[];
    processingMs: number;
  }): Promise<void> {
    await this.pool.query(
      `UPDATE decision_executions SET
         status = 'COMPLETED',
         final_decision = $2, risk_score = $3, confidence = $4,
         explanation = $5, execution_trace = $6,
         completed_at = NOW(), processing_ms = $7
       WHERE id = $1`,
      [
        executionId, data.finalDecision, data.riskScore, data.confidence,
        JSON.stringify(data.explanation), JSON.stringify(data.executionTrace), data.processingMs,
      ]
    );
  }

  async markFailed(executionId: string, error: string, processingMs: number): Promise<void> {
    await this.pool.query(
      `UPDATE decision_executions SET
         status = 'FAILED', output = $2, completed_at = NOW(), processing_ms = $3
       WHERE id = $1`,
      [executionId, JSON.stringify({ error }), processingMs]
    );
  }

  async findById(executionId: string, tenantId: string): Promise<Record<string, unknown> | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM decision_executions WHERE id = $1 AND tenant_id = $2',
      [executionId, tenantId]
    );
    return (rows[0] as Record<string, unknown>) ?? null;
  }

  async findByIdempotencyKey(key: string): Promise<{ id: string; status: string } | null> {
    const { rows } = await this.pool.query<{ id: string; status: string }>(
      'SELECT id, status FROM decision_executions WHERE idempotency_key = $1 LIMIT 1',
      [key]
    );
    return rows[0] ?? null;
  }

  async findByTenant(tenantId: string, opts: {
    status?: ExecutionStatus;
    flowId?: string;
    applicationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: Record<string, unknown>[]; total: number }> {
    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let idx = 2;

    if (opts.status) { conditions.push(`status = $${idx++}`); params.push(opts.status); }
    if (opts.flowId) { conditions.push(`flow_id = $${idx++}`); params.push(opts.flowId); }
    if (opts.applicationId) { conditions.push(`application_id = $${idx++}`); params.push(opts.applicationId); }

    const where = conditions.join(' AND ');
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = opts.offset ?? 0;

    const [{ rows }, { rows: countRows }] = await Promise.all([
      this.pool.query<Record<string, unknown>>(
        `SELECT id, tenant_id, flow_id, application_id, status, final_decision,
                risk_score, confidence, correlation_id, initiated_by_type,
                started_at, completed_at, processing_ms, created_at
         FROM decision_executions WHERE ${where}
         ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      this.pool.query<{ count: string }>(
        `SELECT COUNT(*) FROM decision_executions WHERE ${where}`,
        params
      ),
    ]);

    return { rows, total: parseInt(countRows[0]?.count ?? '0', 10) };
  }

  async appendTrace(executionId: string, entry: TraceEntry): Promise<void> {
    await this.pool.query(
      `UPDATE decision_executions
       SET execution_trace = execution_trace || $2::jsonb
       WHERE id = $1`,
      [executionId, JSON.stringify([entry])]
    );
  }
}
