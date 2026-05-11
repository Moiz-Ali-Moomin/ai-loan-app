import { Injectable, Inject } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import type {
  DecisionOutcome,
  DecisionType,
  RiskLevel,
  PolicyOutcome,
  RiskSignal,
  EscalationReason,
  Explanation,
} from '../schemas/decision.schema';

const logger = createLogger('decision-service:repository');

export interface DecisionRecord {
  id: string;
  application_id: string;
  tenant_id: string;
  decision_type: DecisionType;
  decision: DecisionOutcome;
  confidence: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_signals: RiskSignal[];
  policy_outcomes: PolicyOutcome[];
  retrieved_context_count: number;
  ai_request_id: string;
  explanation: Explanation;
  reasons: string[];
  policy_failures: string[];
  recommended_actions: string[];
  escalation_reasons: EscalationReason[];
  audit_reference: string;
  workflow_run_id?: string;
  correlation_id: string;
  processing_latency_ms: number;
}

export interface DecisionSummaryRow {
  id: string;
  application_id: string;
  tenant_id: string;
  decision_type: string;
  decision: string;
  confidence: number;
  risk_score: number;
  risk_level: string;
  audit_reference: string;
  workflow_run_id: string | null;
  decided_at: string;
  processing_latency_ms: number;
}

export const DB_POOL_TOKEN = 'DB_POOL';

@Injectable()
export class DecisionRepository {
  constructor(@Inject(DB_POOL_TOKEN) private readonly pool: import('@loan-platform/database').DatabasePool) {}

  async save(record: DecisionRecord): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO governance_decisions (
           id, application_id, tenant_id, decision_type, decision,
           confidence, risk_score, risk_level, risk_signals, policy_outcomes,
           retrieved_context_count, ai_request_id, explanation, reasons,
           policy_failures, recommended_actions, escalation_reasons,
           audit_reference, workflow_run_id, correlation_id, processing_latency_ms
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         ON CONFLICT (id) DO NOTHING`,
        [
          record.id, record.application_id, record.tenant_id, record.decision_type, record.decision,
          record.confidence, record.risk_score, record.risk_level,
          JSON.stringify(record.risk_signals), JSON.stringify(record.policy_outcomes),
          record.retrieved_context_count, record.ai_request_id, JSON.stringify(record.explanation),
          JSON.stringify(record.reasons), JSON.stringify(record.policy_failures),
          JSON.stringify(record.recommended_actions), JSON.stringify(record.escalation_reasons),
          record.audit_reference, record.workflow_run_id ?? null, record.correlation_id, record.processing_latency_ms,
        ]
      );
      logger.debug('Decision persisted', { id: record.id, decision: record.decision });
    } catch (err) {
      logger.error('Failed to persist decision', { err, id: record.id });
      throw err;
    }
  }

  async findById(id: string, tenantId: string): Promise<Record<string, unknown> | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM governance_decisions WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    return (rows[0] as Record<string, unknown>) ?? null;
  }

  async findByApplicationId(applicationId: string, tenantId: string): Promise<DecisionSummaryRow[]> {
    const { rows } = await this.pool.query(
      `SELECT id, application_id, tenant_id, decision_type, decision,
              confidence, risk_score, risk_level, audit_reference,
              workflow_run_id, decided_at, processing_latency_ms
       FROM governance_decisions WHERE application_id = $1 AND tenant_id = $2 ORDER BY decided_at DESC`,
      [applicationId, tenantId]
    );
    return rows as DecisionSummaryRow[];
  }

  async findExplanation(id: string, tenantId: string): Promise<Explanation | null> {
    const { rows } = await this.pool.query(
      'SELECT explanation FROM governance_decisions WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    if (!rows[0]) return null;
    return (rows[0] as { explanation: Explanation }).explanation;
  }

  async findRecent(tenantId: string, limit: number): Promise<DecisionSummaryRow[]> {
    const { rows } = await this.pool.query(
      `SELECT id, application_id, tenant_id, decision_type, decision,
              confidence, risk_score, risk_level, audit_reference,
              workflow_run_id, decided_at, processing_latency_ms
       FROM governance_decisions WHERE tenant_id = $1 ORDER BY decided_at DESC LIMIT $2`,
      [tenantId, limit]
    );
    return rows as DecisionSummaryRow[];
  }

  async getMetrics(tenantId: string): Promise<Record<string, unknown>> {
    const { rows } = await this.pool.query(
      `SELECT decision_type, decision, COUNT(*)::int AS total,
              ROUND(AVG(confidence)::numeric, 4) AS avg_confidence,
              ROUND(AVG(risk_score)::numeric, 4) AS avg_risk_score,
              ROUND(AVG(processing_latency_ms)::numeric) AS avg_latency_ms
       FROM governance_decisions
       WHERE tenant_id = $1 AND decided_at > NOW() - INTERVAL '24 hours'
       GROUP BY decision_type, decision ORDER BY decision_type, decision`,
      [tenantId]
    );
    return { metrics: rows, generatedAt: new Date().toISOString() };
  }
}
