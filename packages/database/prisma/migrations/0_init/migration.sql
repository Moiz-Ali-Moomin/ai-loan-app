-- ============================================================
-- AI Loan Governance Platform — Initial Schema
-- Migration: 001
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'starter',
    is_active BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

-- ============================================================
-- USERS / REVIEWERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'reviewer',
    password_hash VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- LOAN REQUESTS
-- ============================================================
CREATE TABLE loan_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    loan_type VARCHAR(50) NOT NULL,
    requested_amount NUMERIC(15, 2) NOT NULL,
    requested_term_months INTEGER NOT NULL,
    purpose TEXT NOT NULL,

    -- Applicant info (denormalized for immutability)
    applicant_id VARCHAR(255) NOT NULL,
    applicant_first_name VARCHAR(100) NOT NULL,
    applicant_last_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    applicant_date_of_birth DATE,
    applicant_national_id VARCHAR(100),
    applicant_employment_status VARCHAR(50),
    applicant_annual_income NUMERIC(15, 2),
    applicant_credit_score INTEGER,
    applicant_existing_debt NUMERIC(15, 2),
    applicant_kyc_verified BOOLEAN NOT NULL DEFAULT false,
    applicant_kyc_verified_at TIMESTAMPTZ,
    applicant_address JSONB,

    -- Business info
    business_info JSONB,

    -- Collateral info
    collateral JSONB,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loan_requests_tenant_id ON loan_requests(tenant_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);
CREATE INDEX idx_loan_requests_applicant_id ON loan_requests(applicant_id);
CREATE INDEX idx_loan_requests_submitted_at ON loan_requests(submitted_at DESC);
CREATE INDEX idx_loan_requests_loan_type ON loan_requests(loan_type);

-- ============================================================
-- WORKFLOW RUNS
-- ============================================================
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    loan_request_id UUID NOT NULL REFERENCES loan_requests(id),
    temporal_workflow_id VARCHAR(255) NOT NULL UNIQUE,
    temporal_run_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    current_step VARCHAR(100),
    loan_status VARCHAR(50),
    policy_version VARCHAR(50),
    ai_model_version VARCHAR(100),
    fraud_model_version VARCHAR(100),
    trace_id VARCHAR(255),
    correlation_id VARCHAR(255),
    steps JSONB NOT NULL DEFAULT '[]',
    error_details JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_runs_tenant_id ON workflow_runs(tenant_id);
CREATE INDEX idx_workflow_runs_loan_request_id ON workflow_runs(loan_request_id);
CREATE INDEX idx_workflow_runs_temporal_workflow_id ON workflow_runs(temporal_workflow_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX idx_workflow_runs_started_at ON workflow_runs(started_at DESC);

-- ============================================================
-- POLICY VERSIONS
-- ============================================================
CREATE TABLE policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    description TEXT,
    content TEXT NOT NULL,
    rego_content TEXT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, version, tenant_id)
);

CREATE INDEX idx_policy_versions_name ON policy_versions(name);
CREATE INDEX idx_policy_versions_is_active ON policy_versions(is_active);
CREATE INDEX idx_policy_versions_tenant_id ON policy_versions(tenant_id);

-- ============================================================
-- AI DECISIONS
-- ============================================================
CREATE TABLE ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_request_id UUID NOT NULL REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    risk_score NUMERIC(5, 4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    recommendation VARCHAR(50) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    reasoning TEXT,
    risk_factors JSONB NOT NULL DEFAULT '[]',
    suggested_terms JSONB,
    model_version VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    prompt_storage_key VARCHAR(500),
    response_storage_key VARCHAR(500),
    tokens_used INTEGER,
    latency_ms INTEGER,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_decisions_loan_request_id ON ai_decisions(loan_request_id);
CREATE INDEX idx_ai_decisions_workflow_run_id ON ai_decisions(workflow_run_id);
CREATE INDEX idx_ai_decisions_tenant_id ON ai_decisions(tenant_id);
CREATE INDEX idx_ai_decisions_risk_level ON ai_decisions(risk_level);
CREATE INDEX idx_ai_decisions_decided_at ON ai_decisions(decided_at DESC);

-- ============================================================
-- POLICY EVALUATIONS
-- ============================================================
CREATE TABLE policy_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_request_id UUID NOT NULL REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    policy_path VARCHAR(255) NOT NULL,
    policy_version VARCHAR(50) NOT NULL,
    decision VARCHAR(50) NOT NULL,
    allow BOOLEAN NOT NULL,
    violations JSONB NOT NULL DEFAULT '[]',
    flags JSONB NOT NULL DEFAULT '[]',
    input_snapshot JSONB NOT NULL,
    evaluation_metadata JSONB,
    duration_ms INTEGER,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_evals_loan_request_id ON policy_evaluations(loan_request_id);
CREATE INDEX idx_policy_evals_workflow_run_id ON policy_evaluations(workflow_run_id);
CREATE INDEX idx_policy_evals_decision ON policy_evaluations(decision);
CREATE INDEX idx_policy_evals_evaluated_at ON policy_evaluations(evaluated_at DESC);

-- ============================================================
-- FRAUD ANALYSIS
-- ============================================================
CREATE TABLE fraud_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_request_id UUID NOT NULL REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    fraud_score NUMERIC(5, 4) NOT NULL,
    is_suspicious BOOLEAN NOT NULL DEFAULT false,
    flags JSONB NOT NULL DEFAULT '[]',
    model_version VARCHAR(100) NOT NULL,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fraud_analyses_loan_request_id ON fraud_analyses(loan_request_id);
CREATE INDEX idx_fraud_analyses_is_suspicious ON fraud_analyses(is_suspicious);

-- ============================================================
-- LOAN DECISIONS
-- ============================================================
CREATE TABLE loan_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_request_id UUID NOT NULL REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(50) NOT NULL,
    approved_amount NUMERIC(15, 2),
    interest_rate NUMERIC(6, 4),
    term_months INTEGER,
    rejection_reason TEXT,
    conditions JSONB DEFAULT '[]',
    decided_by VARCHAR(20) NOT NULL,
    policy_version VARCHAR(50),
    ai_decision_id UUID REFERENCES ai_decisions(id),
    reviewer_id UUID REFERENCES users(id),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loan_decisions_loan_request_id ON loan_decisions(loan_request_id);
CREATE INDEX idx_loan_decisions_workflow_run_id ON loan_decisions(workflow_run_id);
CREATE INDEX idx_loan_decisions_status ON loan_decisions(status);
CREATE INDEX idx_loan_decisions_decided_at ON loan_decisions(decided_at DESC);

-- ============================================================
-- APPROVAL RECORDS (Human Review Queue)
-- ============================================================
CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_request_id UUID NOT NULL REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    reviewer_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    risk_score NUMERIC(5, 4),
    ai_recommendation VARCHAR(50),
    policy_flags JSONB DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    decision VARCHAR(20),
    reviewer_notes TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_records_loan_request_id ON approval_records(loan_request_id);
CREATE INDEX idx_approval_records_reviewer_id ON approval_records(reviewer_id);
CREATE INDEX idx_approval_records_status ON approval_records(status);
CREATE INDEX idx_approval_records_due_at ON approval_records(due_at);

-- ============================================================
-- AUDIT LOGS (Append-only, immutable)
-- ============================================================
CREATE TABLE audit_logs (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    loan_request_id UUID REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID,
    actor_type VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    trace_id VARCHAR(255),
    span_id VARCHAR(255),
    correlation_id VARCHAR(255),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    environment VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partition by month
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE audit_logs_2024_q1_remainder PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE audit_logs_2024_q2 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE audit_logs_2024_q3 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE audit_logs_2024_q4 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE audit_logs_2025_q1 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE audit_logs_2025_q2 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE audit_logs_2025_q3 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE audit_logs_2025_q4 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE audit_logs_2026_q1 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-07-01');
CREATE TABLE audit_logs_2026_q3 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE audit_logs_2026_q4 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');
CREATE TABLE audit_logs_2027_q1 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-01-01') TO ('2027-04-01');
CREATE TABLE audit_logs_2027_q2 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-04-01') TO ('2027-07-01');
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_loan_request_id ON audit_logs(loan_request_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_trace_id ON audit_logs(trace_id);
CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id);

-- Prevent UPDATE and DELETE on audit_logs for immutability
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- ============================================================
-- TRACE METADATA
-- ============================================================
CREATE TABLE trace_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id VARCHAR(255) NOT NULL,
    loan_request_id UUID REFERENCES loan_requests(id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    service_name VARCHAR(100) NOT NULL,
    operation_name VARCHAR(255),
    duration_ms INTEGER,
    status VARCHAR(20),
    error_message TEXT,
    attributes JSONB NOT NULL DEFAULT '{}',
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trace_metadata_trace_id ON trace_metadata(trace_id);
CREATE INDEX idx_trace_metadata_loan_request_id ON trace_metadata(loan_request_id);
CREATE INDEX idx_trace_metadata_tenant_id ON trace_metadata(tenant_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_requests_updated_at BEFORE UPDATE ON loan_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_runs_updated_at BEFORE UPDATE ON workflow_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_versions_updated_at BEFORE UPDATE ON policy_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_records_updated_at BEFORE UPDATE ON approval_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- AI Loan Governance Platform
-- Migration: 003
-- Extend audit_logs partitions through 2035
--
-- 001_initial_schema.sql left coverage ending at 2027-07-01;
-- everything after that fell into audit_logs_default, losing
-- partition pruning. This migration:
--   - Fills the 2027 gap (Q3 + Q4) using the existing quarterly
--     convention already used for 2025/2026/2027.
--   - Adds monthly partitions for 2028-01 through 2035-12 using
--     the audit_logs_YYYY_MM naming already used in 2024.
--   - Uses IF NOT EXISTS throughout for idempotency.
--   - Does NOT touch existing partitions, indexes, or the DEFAULT
--     partition. The DEFAULT partition remains as a catch-all for
--     any data beyond 2035 and as a safety net during deploys.
-- ============================================================

-- ============================================================
-- 2027 gap (Q3 and Q4 were never created in migration 001)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2027_q3 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-07-01') TO ('2027-10-01');

CREATE TABLE IF NOT EXISTS audit_logs_2027_q4 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-10-01') TO ('2028-01-01');

-- ============================================================
-- 2028 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2028_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-01-01') TO ('2028-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-02-01') TO ('2028-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-03-01') TO ('2028-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-04-01') TO ('2028-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-05-01') TO ('2028-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-06-01') TO ('2028-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-07-01') TO ('2028-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-08-01') TO ('2028-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-09-01') TO ('2028-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-10-01') TO ('2028-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-11-01') TO ('2028-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2028_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2028-12-01') TO ('2029-01-01');

-- ============================================================
-- 2029 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2029_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-01-01') TO ('2029-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-02-01') TO ('2029-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-03-01') TO ('2029-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-04-01') TO ('2029-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-05-01') TO ('2029-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-06-01') TO ('2029-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-07-01') TO ('2029-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-08-01') TO ('2029-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-09-01') TO ('2029-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-10-01') TO ('2029-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-11-01') TO ('2029-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2029_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2029-12-01') TO ('2030-01-01');

-- ============================================================
-- 2030 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2030_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-01-01') TO ('2030-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-02-01') TO ('2030-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-03-01') TO ('2030-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-04-01') TO ('2030-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-05-01') TO ('2030-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-06-01') TO ('2030-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-07-01') TO ('2030-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-08-01') TO ('2030-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-09-01') TO ('2030-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-10-01') TO ('2030-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-11-01') TO ('2030-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2030_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2030-12-01') TO ('2031-01-01');

-- ============================================================
-- 2031 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2031_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-01-01') TO ('2031-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-02-01') TO ('2031-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-03-01') TO ('2031-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-04-01') TO ('2031-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-05-01') TO ('2031-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-06-01') TO ('2031-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-07-01') TO ('2031-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-08-01') TO ('2031-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-09-01') TO ('2031-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-10-01') TO ('2031-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-11-01') TO ('2031-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2031_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2031-12-01') TO ('2032-01-01');

-- ============================================================
-- 2032 — monthly (leap year, no special handling needed for
--         range partitioning — bounds are month boundaries)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2032_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-01-01') TO ('2032-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-02-01') TO ('2032-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-03-01') TO ('2032-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-04-01') TO ('2032-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-05-01') TO ('2032-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-06-01') TO ('2032-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-07-01') TO ('2032-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-08-01') TO ('2032-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-09-01') TO ('2032-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-10-01') TO ('2032-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-11-01') TO ('2032-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2032_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2032-12-01') TO ('2033-01-01');

-- ============================================================
-- 2033 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2033_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-01-01') TO ('2033-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-02-01') TO ('2033-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-03-01') TO ('2033-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-04-01') TO ('2033-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-05-01') TO ('2033-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-06-01') TO ('2033-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-07-01') TO ('2033-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-08-01') TO ('2033-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-09-01') TO ('2033-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-10-01') TO ('2033-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-11-01') TO ('2033-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2033_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2033-12-01') TO ('2034-01-01');

-- ============================================================
-- 2034 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2034_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-01-01') TO ('2034-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-02-01') TO ('2034-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-03-01') TO ('2034-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-04-01') TO ('2034-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-05-01') TO ('2034-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-06-01') TO ('2034-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-07-01') TO ('2034-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-08-01') TO ('2034-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-09-01') TO ('2034-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-10-01') TO ('2034-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-11-01') TO ('2034-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2034_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2034-12-01') TO ('2035-01-01');

-- ============================================================
-- 2035 — monthly
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs_2035_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-01-01') TO ('2035-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-02-01') TO ('2035-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-03-01') TO ('2035-04-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-04-01') TO ('2035-05-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-05-01') TO ('2035-06-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-06-01') TO ('2035-07-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-07-01') TO ('2035-08-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-08-01') TO ('2035-09-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-09-01') TO ('2035-10-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-10-01') TO ('2035-11-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-11-01') TO ('2035-12-01');
CREATE TABLE IF NOT EXISTS audit_logs_2035_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2035-12-01') TO ('2036-01-01');
-- ============================================================
-- Migration 004: PII Encryption, Idempotency Keys,
--                HMAC Audit Signatures, AI Reasoning Factors
-- ============================================================

-- ------------------------------------------------------------
-- 1. Idempotency key on loan_requests
--    Prevents duplicate submissions from retries / double-clicks
-- ------------------------------------------------------------
ALTER TABLE loan_requests
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pii_key_version  VARCHAR(20) NOT NULL DEFAULT '1';

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_requests_idempotency_key
  ON loan_requests(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ------------------------------------------------------------
-- 2. Mark PII columns as holding encrypted envelopes
--    Actual encryption happens at the application layer (AES-256-GCM).
--    We add a key_version column so rotation is trackable without
--    re-encrypting everything at once.
--
--    Columns affected:
--      applicant_national_id, applicant_first_name,
--      applicant_last_name,   applicant_phone,
--      applicant_address      (JSONB stored as TEXT envelope)
-- ------------------------------------------------------------

-- Widen national_id to hold base64 envelope (~200 chars)
ALTER TABLE loan_requests
  ALTER COLUMN applicant_national_id TYPE TEXT;

-- Widen name/phone columns for envelope overhead
ALTER TABLE loan_requests
  ALTER COLUMN applicant_first_name  TYPE TEXT,
  ALTER COLUMN applicant_last_name   TYPE TEXT,
  ALTER COLUMN applicant_phone       TYPE TEXT;

-- applicant_address: store as TEXT (encrypted JSON envelope) instead of JSONB
-- We must drop and recreate because Postgres won't cast JSONB→TEXT directly
ALTER TABLE loan_requests
  ADD COLUMN IF NOT EXISTS applicant_address_enc TEXT;

-- ------------------------------------------------------------
-- 3. HMAC signature on audit_logs
--    Each record gets an HMAC-SHA256 signature over
--    (payload + previous_hash) using AUDIT_HMAC_KEY.
--    This makes tampering detectable even by someone with DB
--    write access who could recompute SHA-256 hashes.
-- ------------------------------------------------------------
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS signature VARCHAR(64);

-- Index for integrity scan queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_signature
  ON audit_logs(signature)
  WHERE signature IS NOT NULL;

-- ------------------------------------------------------------
-- 4. AI decisions: structured reasoning_factors with per-factor
--    direction/weight/value for ECOA adverse action notices
-- ------------------------------------------------------------
ALTER TABLE ai_decisions
  ADD COLUMN IF NOT EXISTS reasoning_factors JSONB NOT NULL DEFAULT '[]';

-- Backfill reasoning_factors from existing risk_factors where empty
UPDATE ai_decisions
SET reasoning_factors = risk_factors
WHERE reasoning_factors = '[]'::jsonb
  AND risk_factors != '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_ai_decisions_reasoning_factors
  ON ai_decisions USING GIN(reasoning_factors);

-- ------------------------------------------------------------
-- 5. Adverse action notices tracking table
--    Records when FCRA-required adverse action letters were
--    generated and delivered (30-day regulatory deadline).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS adverse_action_notices (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_request_id   UUID NOT NULL REFERENCES loan_requests(id),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at      TIMESTAMPTZ,
  delivery_method   VARCHAR(50),  -- 'EMAIL' | 'MAIL' | 'DOWNLOAD'
  deadline_at       TIMESTAMPTZ NOT NULL,  -- generated_at + 30 days
  content_key       VARCHAR(500), -- MinIO key for PDF artifact
  reasons           JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adverse_action_loan ON adverse_action_notices(loan_request_id);
CREATE INDEX IF NOT EXISTS idx_adverse_action_deadline ON adverse_action_notices(deadline_at)
  WHERE delivered_at IS NULL;
-- ============================================================
-- AI Loan Governance Platform — pgvector RAG Infrastructure
-- Migration: 005
--
-- INDEXING STRATEGY: IVFFLAT (not HNSW)
--   Rationale: this platform is metadata-heavy, tenant-filter-heavy,
--   and operates at moderate scale where IVFFLAT's filtered-search
--   characteristics, lower memory usage, and operational simplicity
--   outweigh HNSW's raw recall advantage at high scale.
--
-- PARTITIONING NOTE: table is designed for future HASH partitioning
--   by tenant_id. The schema and all repository abstractions are
--   written partition-aware. Actual partitioning can be applied once
--   per-tenant row counts justify it (>5M rows / tenant typical).
-- ============================================================

-- pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- DOCUMENT EMBEDDINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS document_embeddings (
    id              UUID        NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type   TEXT        NOT NULL,   -- 'kyc_guideline' | 'aml_policy' | 'sop' | 'risk_policy' | 'compliance_manual' | 'regulation'
    source          TEXT,                   -- original file path / URL / identifier
    title           TEXT,                   -- human-readable document title
    content         TEXT        NOT NULL,   -- raw chunk text stored for retrieval
    chunk_index     INTEGER     NOT NULL,   -- 0-based position within source document
    embedding       VECTOR(384) NOT NULL,   -- dense embedding vector (384-dim, BGE-small-en-v1.5)
    metadata        JSONB,                  -- jurisdiction, policy_version, effective_date, author, tags, etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id, tenant_id)             -- composite PK — ready for HASH partition by tenant_id
);

-- ============================================================
-- IVFFLAT VECTOR INDEX
--   lists = 100 is a balanced choice for up to ~10M rows.
--   Increase lists proportionally when total rows grow (sqrt(n) heuristic).
--   Re-run ANALYZE after bulk ingestion to keep planner stats fresh.
--   probes is set at query time via SET ivfflat.probes = N.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
    ON document_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ============================================================
-- SCALAR FILTER INDEXES
--   These are the primary pre-filters applied before vector search.
--   Keeping them separate (not partial) lets the planner combine
--   them efficiently with the IVFFLAT scan via bitmap index merge.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_doc_emb_tenant_id
    ON document_embeddings (tenant_id);

CREATE INDEX IF NOT EXISTS idx_doc_emb_document_type
    ON document_embeddings (document_type);

CREATE INDEX IF NOT EXISTS idx_doc_emb_created_at
    ON document_embeddings (created_at DESC);

-- Composite covering index — the single most important index for
-- the core query pattern: tenant_id + document_type filter + recency ordering
CREATE INDEX IF NOT EXISTS idx_doc_emb_tenant_type_created
    ON document_embeddings (tenant_id, document_type, created_at DESC);

-- GIN index for JSONB metadata — enables @>, ?, ?| operators on
-- jurisdiction, policy_version, effective_date, tags etc.
CREATE INDEX IF NOT EXISTS idx_doc_emb_metadata_gin
    ON document_embeddings USING GIN (metadata);

-- ============================================================
-- INGESTION JOBS — tracks async ingestion runs for auditability
-- ============================================================
CREATE TABLE IF NOT EXISTS embedding_ingestion_jobs (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type   TEXT        NOT NULL,
    source          TEXT        NOT NULL,
    title           TEXT,
    status          TEXT        NOT NULL DEFAULT 'pending',  -- pending | processing | completed | failed
    total_chunks    INTEGER,
    processed_chunks INTEGER    NOT NULL DEFAULT 0,
    failed_chunks   INTEGER     NOT NULL DEFAULT 0,
    error_message   TEXT,
    metadata        JSONB,
    initiated_by    UUID        REFERENCES users(id),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_tenant_id
    ON embedding_ingestion_jobs (tenant_id);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status
    ON embedding_ingestion_jobs (status);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_created_at
    ON embedding_ingestion_jobs (created_at DESC);

CREATE TRIGGER update_ingestion_jobs_updated_at
    BEFORE UPDATE ON embedding_ingestion_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RETRIEVAL AUDIT LOG — compliance-required record of every
-- semantic search executed in the platform.
-- Separate from audit_logs to avoid bloating the main chain.
-- ============================================================
CREATE TABLE IF NOT EXISTS vector_retrieval_audit (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requester_id    UUID        REFERENCES users(id),
    requester_type  TEXT        NOT NULL,   -- 'user' | 'service' | 'workflow'
    service_name    TEXT        NOT NULL,
    query_hash      TEXT        NOT NULL,   -- SHA-256 of the query text (PII-safe)
    document_types  TEXT[]      NOT NULL DEFAULT '{}',
    metadata_filter JSONB,
    retrieved_count INTEGER     NOT NULL DEFAULT 0,
    retrieved_doc_ids UUID[]    NOT NULL DEFAULT '{}',
    similarity_scores FLOAT[]   NOT NULL DEFAULT '{}',
    top_k           INTEGER     NOT NULL,
    similarity_threshold FLOAT  NOT NULL,
    latency_ms      INTEGER,
    trace_id        TEXT,
    correlation_id  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vra_tenant_id
    ON vector_retrieval_audit (tenant_id);

CREATE INDEX IF NOT EXISTS idx_vra_requester_id
    ON vector_retrieval_audit (requester_id);

CREATE INDEX IF NOT EXISTS idx_vra_created_at
    ON vector_retrieval_audit (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vra_query_hash
    ON vector_retrieval_audit (query_hash);

-- Immutability — retrieval audit records must not be modified
CREATE RULE no_update_vra AS ON UPDATE TO vector_retrieval_audit DO INSTEAD NOTHING;
CREATE RULE no_delete_vra AS ON DELETE TO vector_retrieval_audit DO INSTEAD NOTHING;
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
