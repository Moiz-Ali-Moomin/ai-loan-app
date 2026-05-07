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
    workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id),
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
    workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Partition by month
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
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
