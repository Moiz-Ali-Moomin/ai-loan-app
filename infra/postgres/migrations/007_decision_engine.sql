-- ============================================================
-- Migration 007: Decision Engine Tables
--
-- Introduces:
--   decision_flows          — versioned, publishable flow definitions
--   decision_nodes          — individual nodes within a flow (graph edges
--                             encoded as nextNodeId / fallbackNodeId)
--   decision_executions     — runtime execution records (immutable audit trail)
--   decision_node_executions— per-node execution history within an execution
--   approval_requests       — human-in-the-loop approval gates
--   flow_versions           — published snapshot of a flow (immutable after publish)
-- ============================================================

-- ─── Decision Flows ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_flows (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  description     TEXT,
  version         TEXT        NOT NULL DEFAULT '1.0.0',
  status          TEXT        NOT NULL DEFAULT 'DRAFT'
                              CHECK (status IN ('DRAFT', 'PUBLISHED', 'DEPRECATED', 'ARCHIVED')),
  created_by      TEXT        NOT NULL,
  updated_by      TEXT,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  tags            TEXT[]      NOT NULL DEFAULT '{}',
  published_at    TIMESTAMPTZ,
  deprecated_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name, version)
);

CREATE INDEX IF NOT EXISTS idx_decision_flows_tenant
  ON decision_flows (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_flows_name
  ON decision_flows (tenant_id, name, version);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_decision_flows_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decision_flows_updated_at ON decision_flows;
CREATE TRIGGER trg_decision_flows_updated_at
  BEFORE UPDATE ON decision_flows
  FOR EACH ROW EXECUTE FUNCTION update_decision_flows_updated_at();

-- ─── Decision Nodes ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_nodes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id         UUID        NOT NULL REFERENCES decision_flows(id) ON DELETE CASCADE,
  tenant_id       TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN (
                    'START', 'RULE', 'CONDITION', 'AI', 'SCORE',
                    'APPROVAL', 'ACTION', 'WEBHOOK', 'DELAY',
                    'HUMAN_REVIEW', 'END')),
  config          JSONB       NOT NULL DEFAULT '{}',
  -- Graph edges
  next_node_id    UUID        REFERENCES decision_nodes(id) ON DELETE SET NULL,
  fallback_node_id UUID       REFERENCES decision_nodes(id) ON DELETE SET NULL,
  -- Branching: list of {condition, nodeId} for CONDITION nodes
  branches        JSONB       NOT NULL DEFAULT '[]',
  -- Reliability
  timeout_ms      INT         NOT NULL DEFAULT 30000,
  retry_attempts  INT         NOT NULL DEFAULT 3,
  retry_delay_ms  INT         NOT NULL DEFAULT 1000,
  -- Ordering
  position_x      INT         NOT NULL DEFAULT 0,
  position_y      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_nodes_flow
  ON decision_nodes (flow_id, type);

-- ─── Flow Published Snapshots ─────────────────────────────────────────────────
-- Immutable snapshot of a flow + all its nodes at publish time.
-- Executions always reference the snapshot, not the mutable flow.

CREATE TABLE IF NOT EXISTS flow_snapshots (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id         UUID        NOT NULL REFERENCES decision_flows(id),
  tenant_id       TEXT        NOT NULL,
  version         TEXT        NOT NULL,
  checksum        TEXT        NOT NULL,
  snapshot        JSONB       NOT NULL,   -- full serialized graph
  published_by    TEXT        NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flow_id, version)
);

-- Immutability: snapshots must never change after publish
CREATE RULE flow_snapshots_no_update AS
  ON UPDATE TO flow_snapshots DO INSTEAD NOTHING;

CREATE RULE flow_snapshots_no_delete AS
  ON DELETE TO flow_snapshots DO INSTEAD NOTHING;

CREATE INDEX IF NOT EXISTS idx_flow_snapshots_flow
  ON flow_snapshots (flow_id, published_at DESC);

-- ─── Decision Executions ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_executions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           TEXT        NOT NULL,
  flow_id             UUID        NOT NULL REFERENCES decision_flows(id),
  flow_snapshot_id    UUID        REFERENCES flow_snapshots(id),
  -- Links to existing platform entities
  application_id      UUID,
  workflow_run_id     UUID,
  temporal_workflow_id TEXT,
  temporal_run_id     TEXT,
  -- Status lifecycle
  status              TEXT        NOT NULL DEFAULT 'PENDING'
                                  CHECK (status IN (
                                    'PENDING', 'RUNNING', 'PAUSED',
                                    'AWAITING_APPROVAL', 'COMPLETED',
                                    'FAILED', 'TIMED_OUT', 'CANCELLED')),
  -- Inputs / outputs
  input               JSONB       NOT NULL DEFAULT '{}',
  output              JSONB,
  -- Execution trace (ordered list of node execution summaries)
  execution_trace     JSONB       NOT NULL DEFAULT '[]',
  -- Decision result
  final_decision      TEXT        CHECK (final_decision IN (
                                    'APPROVE', 'REJECT', 'MANUAL_REVIEW', 'ESCALATE')),
  risk_score          NUMERIC(6,4) CHECK (risk_score BETWEEN 0 AND 1),
  confidence          NUMERIC(6,4) CHECK (confidence BETWEEN 0 AND 1),
  explanation         JSONB,
  -- Idempotency
  idempotency_key     TEXT        UNIQUE,
  correlation_id      TEXT        NOT NULL,
  -- Actor
  initiated_by        TEXT,
  initiated_by_type   TEXT        NOT NULL DEFAULT 'SYSTEM'
                                  CHECK (initiated_by_type IN ('USER', 'SYSTEM', 'WORKFLOW', 'API')),
  -- Timing
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  paused_at           TIMESTAMPTZ,
  timeout_at          TIMESTAMPTZ,
  processing_ms       INT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions for 2025–2026 (extend as needed)
CREATE TABLE IF NOT EXISTS decision_executions_2025_01
  PARTITION OF decision_executions
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS decision_executions_2025_06
  PARTITION OF decision_executions
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_01
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_02
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_03
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_04
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_05
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_06
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_07
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_08
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_09
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_10
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_11
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE IF NOT EXISTS decision_executions_2026_12
  PARTITION OF decision_executions
  FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE IF NOT EXISTS decision_executions_default
  PARTITION OF decision_executions DEFAULT;

-- Indexes (applied to parent; inherited by partitions)
CREATE INDEX IF NOT EXISTS idx_de_tenant_status
  ON decision_executions (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_de_application
  ON decision_executions (application_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_de_flow
  ON decision_executions (flow_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_de_temporal
  ON decision_executions (temporal_workflow_id)
  WHERE temporal_workflow_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_de_idempotency
  ON decision_executions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ─── Per-Node Execution History ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_node_executions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    UUID        NOT NULL,   -- references decision_executions(id) — no FK across partition
  tenant_id       TEXT        NOT NULL,
  node_id         UUID        NOT NULL REFERENCES decision_nodes(id),
  node_type       TEXT        NOT NULL,
  node_name       TEXT        NOT NULL,
  status          TEXT        NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED', 'TIMED_OUT')),
  input           JSONB       NOT NULL DEFAULT '{}',
  output          JSONB,
  error           JSONB,
  duration_ms     INT,
  retry_count     INT         NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dne_execution
  ON decision_node_executions (execution_id, started_at);

CREATE INDEX IF NOT EXISTS idx_dne_tenant_node
  ON decision_node_executions (tenant_id, node_id);

-- Immutability: node execution records must not be changed once written
CREATE RULE decision_node_executions_no_update AS
  ON UPDATE TO decision_node_executions DO INSTEAD NOTHING;

-- ─── Approval Requests ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS approval_requests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           TEXT        NOT NULL,
  execution_id        UUID        NOT NULL,
  node_id             UUID        NOT NULL REFERENCES decision_nodes(id),
  application_id      UUID,
  -- Who needs to approve
  assigned_to         TEXT,       -- userId or role
  assigned_role       TEXT,
  -- State
  status              TEXT        NOT NULL DEFAULT 'PENDING'
                                  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'DELEGATED')),
  priority            TEXT        NOT NULL DEFAULT 'NORMAL'
                                  CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  -- Decision
  decision            TEXT        CHECK (decision IN ('APPROVE', 'REJECT', 'DELEGATE', 'REQUEST_INFO')),
  decided_by          TEXT,
  decided_at          TIMESTAMPTZ,
  decision_notes      TEXT,
  -- Context snapshot shown to reviewer
  context_snapshot    JSONB       NOT NULL DEFAULT '{}',
  -- SLA
  due_at              TIMESTAMPTZ NOT NULL,
  escalate_at         TIMESTAMPTZ,
  escalated_to        TEXT,
  escalated_at        TIMESTAMPTZ,
  -- Delegation chain
  delegated_from      UUID        REFERENCES approval_requests(id),
  -- Temporal signal reference
  temporal_workflow_id TEXT,
  temporal_signal_name TEXT,
  -- Audit
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_tenant_status
  ON approval_requests (tenant_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_approvals_execution
  ON approval_requests (execution_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_approvals_assignee
  ON approval_requests (assigned_to, status)
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_approvals_application
  ON approval_requests (application_id, tenant_id);

CREATE OR REPLACE FUNCTION update_approval_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_approval_requests_updated_at ON approval_requests;
CREATE TRIGGER trg_approval_requests_updated_at
  BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_approval_requests_updated_at();

-- ─── Comments ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE decision_flows IS
  'Versioned, publishable decision flow definitions. Only PUBLISHED flows may be executed.';

COMMENT ON TABLE decision_nodes IS
  'Individual nodes in a decision graph. Edges encoded via next_node_id and branches JSONB.';

COMMENT ON TABLE flow_snapshots IS
  'Immutable published snapshot of a flow and all its nodes. Executions reference the snapshot, not the mutable flow, for auditability.';

COMMENT ON TABLE decision_executions IS
  'Partitioned runtime execution records. One row per execution of a decision flow.';

COMMENT ON TABLE decision_node_executions IS
  'Per-node execution history within a decision execution. Immutable after write.';

COMMENT ON TABLE approval_requests IS
  'Human-in-the-loop approval gates. Linked to Temporal signal-based pause/resume.';
