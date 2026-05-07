import { createHash, randomUUID } from 'crypto';
import type { Pool } from 'pg';
import type { AuditRecord, AuditMetadata, DecisionLineage } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('audit-service:repository');

export class AuditRepository {
  constructor(private readonly pool: Pool) {}

  async createRecord(params: {
    tenantId: string;
    loanRequestId?: string;
    workflowRunId?: string;
    eventType: string;
    actorId?: string;
    actorType: string;
    serviceName: string;
    payload: Record<string, unknown>;
    metadata: AuditMetadata;
  }): Promise<AuditRecord> {
    const id = randomUUID();

    // Fetch previous hash for chain integrity
    const { rows: prevRows } = await this.pool.query(
      `SELECT hash FROM audit_logs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [params.tenantId]
    );
    const previousHash = prevRows[0]?.hash as string | undefined;

    // Compute tamper-evident hash
    const hashInput = JSON.stringify({
      id,
      tenantId: params.tenantId,
      loanRequestId: params.loanRequestId,
      eventType: params.eventType,
      actorType: params.actorType,
      serviceName: params.serviceName,
      payload: params.payload,
      traceId: params.metadata.traceId,
      previousHash,
      timestamp: new Date().toISOString(),
    });
    const hash = createHash('sha256').update(hashInput).digest('hex');

    const { rows } = await this.pool.query(
      `INSERT INTO audit_logs (
        id, tenant_id, loan_request_id, workflow_run_id, event_type,
        actor_id, actor_type, service_name, payload,
        trace_id, span_id, correlation_id, version, environment,
        hash, previous_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        id,
        params.tenantId,
        params.loanRequestId ?? null,
        params.workflowRunId ?? null,
        params.eventType,
        params.actorId ?? null,
        params.actorType,
        params.serviceName,
        JSON.stringify(params.payload),
        params.metadata.traceId,
        params.metadata.spanId ?? null,
        params.metadata.correlationId,
        params.metadata.version,
        params.metadata.environment,
        hash,
        previousHash ?? null,
      ]
    );

    logger.info('Audit record created', {
      id,
      eventType: params.eventType,
      tenantId: params.tenantId,
      loanRequestId: params.loanRequestId,
      traceId: params.metadata.traceId,
    });

    return rows[0] as AuditRecord;
  }

  async getByLoanRequest(loanRequestId: string): Promise<AuditRecord[]> {
    const { rows } = await this.pool.query(
      `SELECT * FROM audit_logs WHERE loan_request_id = $1 ORDER BY created_at ASC`,
      [loanRequestId]
    );
    return rows as AuditRecord[];
  }

  async getDecisionLineage(loanRequestId: string): Promise<DecisionLineage> {
    const [auditRows, policyRows, aiRows, approvalRows] = await Promise.all([
      this.pool.query('SELECT * FROM audit_logs WHERE loan_request_id = $1 ORDER BY created_at ASC', [loanRequestId]),
      this.pool.query('SELECT policy_path, policy_version, decision, evaluated_at FROM policy_evaluations WHERE loan_request_id = $1', [loanRequestId]),
      this.pool.query('SELECT model_version, prompt_version, risk_score, recommendation, decided_at FROM ai_decisions WHERE loan_request_id = $1', [loanRequestId]),
      this.pool.query('SELECT reviewer_id, decision, completed_at FROM approval_records WHERE loan_request_id = $1', [loanRequestId]),
    ]);

    const { rows: wfRows } = await this.pool.query(
      'SELECT id FROM workflow_runs WHERE loan_request_id = $1 LIMIT 1',
      [loanRequestId]
    );

    const timeline = (auditRows.rows as AuditRecord[]).map((r) => ({
      timestamp: r.createdAt,
      event: r.eventType,
      actor: r.actorType,
      details: r.serviceName,
    }));

    return {
      loanRequestId,
      workflowRunId: wfRows.rows[0]?.id ?? '',
      events: auditRows.rows as AuditRecord[],
      policyVersions: policyRows.rows.map((r: Record<string, unknown>) => ({
        policyName: String(r['policy_path']),
        version: String(r['policy_version']),
        evaluatedAt: String(r['evaluated_at']),
        decision: String(r['decision']),
      })),
      aiDecisions: aiRows.rows.map((r: Record<string, unknown>) => ({
        modelVersion: String(r['model_version']),
        promptVersion: String(r['prompt_version']),
        riskScore: Number(r['risk_score']),
        recommendation: String(r['recommendation']),
        decidedAt: String(r['decided_at']),
      })),
      humanApprovals: approvalRows.rows.map((r: Record<string, unknown>) => ({
        reviewerId: String(r['reviewer_id']),
        decision: String(r['decision']),
        decidedAt: String(r['completed_at']),
      })),
      timeline,
    };
  }

  async verifyChainIntegrity(loanRequestId: string): Promise<{ valid: boolean; brokenAt?: string }> {
    const { rows } = await this.pool.query(
      'SELECT id, hash, previous_hash, tenant_id, loan_request_id, event_type, actor_type, service_name, payload, trace_id, created_at FROM audit_logs WHERE loan_request_id = $1 ORDER BY created_at ASC',
      [loanRequestId]
    );

    for (let i = 1; i < rows.length; i++) {
      const current = rows[i] as Record<string, unknown>;
      const previous = rows[i - 1] as Record<string, unknown>;
      if (current['previous_hash'] !== previous['hash']) {
        logger.warn('Audit chain integrity violation detected', { id: current['id'], loanRequestId });
        return { valid: false, brokenAt: String(current['id']) };
      }
    }

    return { valid: true };
  }
}
