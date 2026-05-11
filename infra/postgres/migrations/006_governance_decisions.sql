-- ============================================================
-- Migration 006: Governance Decisions table
-- Stores structured, immutable decision records produced by
-- the Decision Service. Each row is the authoritative record
-- of a financial decision including AI reasoning, policy
-- outcomes, confidence scores, and full explainability data.
-- ============================================================

CREATE TABLE IF NOT EXISTS governance_decisions (
  id                      UUID        PRIMARY KEY,
  application_id          UUID        NOT NULL,
  tenant_id               TEXT        NOT NULL,
  decision_type           TEXT        NOT NULL CHECK (decision_type IN ('UNDERWRITING', 'KYC', 'AML', 'REVIEW')),
  decision                TEXT        NOT NULL CHECK (decision IN ('APPROVE', 'REJECT', 'MANUAL_REVIEW', 'ESCALATE')),
  confidence              NUMERIC(6,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  risk_score              NUMERIC(6,4) NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
  risk_level              TEXT        NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  risk_signals            JSONB       NOT NULL DEFAULT '[]',
  policy_outcomes         JSONB       NOT NULL DEFAULT '[]',
  retrieved_context_count INT         NOT NULL DEFAULT 0,
  ai_request_id           TEXT,
  explanation             JSONB       NOT NULL DEFAULT '{}',
  reasons                 JSONB       NOT NULL DEFAULT '[]',
  policy_failures         JSONB       NOT NULL DEFAULT '[]',
  recommended_actions     JSONB       NOT NULL DEFAULT '[]',
  escalation_reasons      JSONB       NOT NULL DEFAULT '[]',
  audit_reference         UUID        NOT NULL,
  workflow_run_id         UUID,
  correlation_id          TEXT        NOT NULL,
  processing_latency_ms   INT         NOT NULL,
  decided_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutability: decisions must never be modified or deleted
CREATE RULE governance_decisions_no_update AS
  ON UPDATE TO governance_decisions DO INSTEAD NOTHING;

CREATE RULE governance_decisions_no_delete AS
  ON DELETE TO governance_decisions DO INSTEAD NOTHING;

-- Indexes for query patterns
CREATE INDEX IF NOT EXISTS idx_governance_decisions_application_id
  ON governance_decisions (application_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_tenant_decided
  ON governance_decisions (tenant_id, decided_at DESC);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_decision_type
  ON governance_decisions (decision_type, decision);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_risk_level
  ON governance_decisions (risk_level, decided_at DESC);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_audit_reference
  ON governance_decisions (audit_reference);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_workflow_run
  ON governance_decisions (workflow_run_id)
  WHERE workflow_run_id IS NOT NULL;

-- GIN index for JSONB queries on escalation_reasons and policy_failures
CREATE INDEX IF NOT EXISTS idx_governance_decisions_escalation_reasons
  ON governance_decisions USING GIN (escalation_reasons);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_policy_failures
  ON governance_decisions USING GIN (policy_failures);

-- Comments
COMMENT ON TABLE governance_decisions IS
  'Immutable audit-safe record of every financial decision produced by the Decision Service. UPDATE and DELETE are blocked by SQL RULE.';

COMMENT ON COLUMN governance_decisions.explanation IS
  'Full structured explanation including reason codes, evidence, policy references, and AI reasoning excerpt.';

COMMENT ON COLUMN governance_decisions.audit_reference IS
  'Cross-reference to audit_logs table entry for this decision event.';
