import { createHash, randomUUID } from 'crypto';
import type { Pool } from 'pg';
import type { AuditRecord, AuditMetadata, DecisionLineage } from '@loan-platform/shared-types';
import { signAuditRecord, verifyAuditSignature } from '@loan-platform/crypto';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('audit-service:repository');

function buildHashInput(params: {
  id: string;
  tenantId: string;
  loanRequestId?: string;
  eventType: string;
  actorType: string;
  serviceName: string;
  payload: Record<string, unknown>;
  traceId: string;
  previousHash?: string;
  timestamp: string;
}): string {
  return JSON.stringify({
    id: params.id,
    tenantId: params.tenantId,
    loanRequestId: params.loanRequestId,
    eventType: params.eventType,
    actorType: params.actorType,
    serviceName: params.serviceName,
    payload: params.payload,
    traceId: params.traceId,
    previousHash: params.previousHash,
    timestamp: params.timestamp,
  });
}

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
    const timestamp = new Date().toISOString();

    const { rows: prevRows } = await this.pool.query(
      `SELECT hash FROM audit_logs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [params.tenantId]
    );
    const previousHash = prevRows[0]?.hash as string | undefined;

    const hashInput = buildHashInput({
      id,
      tenantId: params.tenantId,
      loanRequestId: params.loanRequestId,
      eventType: params.eventType,
      actorType: params.actorType,
      serviceName: params.serviceName,
      payload: params.payload,
      traceId: params.metadata.traceId,
      previousHash,
      timestamp,
    });

    // SHA-256 chain hash (tamper-evident ordering)
    const hash = createHash('sha256').update(hashInput).digest('hex');

    // HMAC-SHA256 signature (tamper-evident content — requires AUDIT_HMAC_KEY)
    // Falls back gracefully if key not configured (dev/test without secrets)
    let signature: string | null = null;
    try {
      signature = signAuditRecord(hashInput);
    } catch {
      logger.warn('AUDIT_HMAC_KEY not set — audit record will not be HMAC-signed');
    }

    const { rows } = await this.pool.query(
      `INSERT INTO audit_logs (
        id, tenant_id, loan_request_id, workflow_run_id, event_type,
        actor_id, actor_type, service_name, payload,
        trace_id, span_id, correlation_id, version, environment,
        hash, previous_hash, signature
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
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
        signature,
      ]
    );

    logger.info('Audit record created', {
      id,
      eventType: params.eventType,
      tenantId: params.tenantId,
      loanRequestId: params.loanRequestId,
      traceId: params.metadata.traceId,
      hmacSigned: signature !== null,
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

    const timeline = (auditRows.rows as (AuditRecord & Record<string, unknown>)[]).map((r) => ({
      timestamp: (r['created_at'] ?? r.createdAt) as string,
      event: (r['event_type'] ?? r.eventType) as string,
      actor: (r['actor_type'] ?? r.actorType) as string,
      details: (r['service_name'] ?? r.serviceName) as string,
    }));

    return {
      loanRequestId,
      workflowRunId: (wfRows[0] as Record<string, unknown> | undefined)?.['id'] as string ?? '',
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

  async verifyChainIntegrity(loanRequestId: string): Promise<{
    valid: boolean;
    brokenAt?: string;
    hmacValid?: boolean;
    hmacFailedAt?: string;
    totalRecords: number;
  }> {
    const { rows } = await this.pool.query(
      `SELECT id, hash, previous_hash, signature, tenant_id, loan_request_id,
              event_type, actor_type, service_name, payload, trace_id, created_at
       FROM audit_logs WHERE loan_request_id = $1 ORDER BY created_at ASC`,
      [loanRequestId]
    );

    let hmacValid = true;
    let hmacFailedAt: string | undefined;

    // Verify SHA-256 hash chain
    for (let i = 1; i < rows.length; i++) {
      const current = rows[i] as Record<string, unknown>;
      const previous = rows[i - 1] as Record<string, unknown>;
      if (current['previous_hash'] !== previous['hash']) {
        logger.warn('Audit chain integrity violation', { id: current['id'], loanRequestId });
        return { valid: false, brokenAt: String(current['id']), totalRecords: rows.length };
      }
    }

    // Verify HMAC signatures where present
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const sig = r['signature'] as string | null;
      if (!sig) continue;

      const hashInput = buildHashInput({
        id: String(r['id']),
        tenantId: String(r['tenant_id']),
        loanRequestId: r['loan_request_id'] ? String(r['loan_request_id']) : undefined,
        eventType: String(r['event_type']),
        actorType: String(r['actor_type']),
        serviceName: String(r['service_name']),
        payload: JSON.parse(String(r['payload'])) as Record<string, unknown>,
        traceId: String(r['trace_id']),
        previousHash: r['previous_hash'] ? String(r['previous_hash']) : undefined,
        timestamp: String(r['created_at']),
      });

      try {
        if (!verifyAuditSignature(hashInput, sig)) {
          hmacValid = false;
          hmacFailedAt = String(r['id']);
          logger.warn('Audit HMAC signature invalid', { id: r['id'], loanRequestId });
          break;
        }
      } catch {
        // AUDIT_HMAC_KEY not configured — skip HMAC check
        break;
      }
    }

    return { valid: true, hmacValid, hmacFailedAt, totalRecords: rows.length };
  }
}
