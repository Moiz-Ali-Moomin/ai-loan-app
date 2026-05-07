-- ============================================================
-- AI Loan Governance Platform — Seed Data
-- ============================================================

-- Tenant
INSERT INTO tenants (id, name, slug, plan, is_active, config) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme FinTech Corp', 'acme-fintech', 'enterprise', true,
   '{"maxLoanAmount": 5000000, "requiresKyc": true, "highRiskThreshold": 0.75}'),
  ('22222222-2222-2222-2222-222222222222', 'Sunrise Lending', 'sunrise-lending', 'professional', true,
   '{"maxLoanAmount": 1000000, "requiresKyc": true, "highRiskThreshold": 0.80}')
ON CONFLICT DO NOTHING;

-- Users (admin + reviewers)
INSERT INTO users (id, tenant_id, email, first_name, last_name, role, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin@acme-fintech.com', 'Admin', 'User', 'admin', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'reviewer1@acme-fintech.com', 'Sarah', 'Chen', 'reviewer', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'reviewer2@acme-fintech.com', 'James', 'Rodriguez', 'reviewer', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'admin@sunrise.com', 'Admin', 'Sunrise', 'admin', true)
ON CONFLICT DO NOTHING;

-- Policy versions
INSERT INTO policy_versions (id, name, version, description, content, rego_content, checksum, is_active, effective_from, created_by) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppppp',
   'loan_approval', '1.0.0',
   'Initial loan approval policy with KYC, credit score, DTI, and amount thresholds',
   'Loan approval governance policy v1.0.0 - Covers KYC requirements, minimum credit score (580), max DTI (45%), high-value loan escalation ($500k+)',
   'package loan.approval\n-- See infra/opa/policies/loan/approval.rego',
   'abc123def456abc123def456abc123def456abc123def456abc123def456abc12',
   true,
   NOW(),
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT DO NOTHING;

-- Sample loan requests (various scenarios)
INSERT INTO loan_requests (
  id, tenant_id, status, loan_type, requested_amount, requested_term_months, purpose,
  applicant_id, applicant_first_name, applicant_last_name, applicant_email, applicant_phone,
  applicant_date_of_birth, applicant_national_id, applicant_employment_status,
  applicant_annual_income, applicant_credit_score, applicant_existing_debt,
  applicant_kyc_verified, applicant_kyc_verified_at,
  applicant_address, metadata
) VALUES
  -- Scenario 1: Clean approve — excellent credit, low amount
  (
    'loan0001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'APPROVED', 'PERSONAL', 25000, 36, 'Home renovation and emergency fund',
    'appl0001', 'Emily', 'Johnson', 'emily.johnson@example.com', '+1-555-0101',
    '1985-03-15', 'SSN-001-23-4567', 'EMPLOYED',
    95000, 750, 5000, true, NOW() - INTERVAL '30 days',
    '{"street": "123 Main St", "city": "Boston", "state": "MA", "postalCode": "02101", "country": "US"}',
    '{"correlationId": "corr-001", "traceId": "trace-001"}'
  ),
  -- Scenario 2: High-value loan needing human review
  (
    'loan0002-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'AWAITING_HUMAN_APPROVAL', 'BUSINESS', 750000, 84, 'Business expansion - new manufacturing facility',
    'appl0002', 'Marcus', 'Williams', 'marcus.williams@example.com', '+1-555-0202',
    '1978-07-22', 'SSN-002-34-5678', 'SELF_EMPLOYED',
    280000, 720, 120000, true, NOW() - INTERVAL '15 days',
    '{"street": "456 Commerce Ave", "city": "Chicago", "state": "IL", "postalCode": "60601", "country": "US"}',
    '{"correlationId": "corr-002", "traceId": "trace-002"}'
  ),
  -- Scenario 3: Rejected — poor credit, no KYC
  (
    'loan0003-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'REJECTED', 'PERSONAL', 15000, 24, 'Debt consolidation',
    'appl0003', 'Robert', 'Smith', 'robert.smith@example.com', '+1-555-0303',
    '1990-11-08', 'SSN-003-45-6789', 'UNEMPLOYED',
    22000, 520, 35000, false, NULL,
    '{"street": "789 Oak St", "city": "Detroit", "state": "MI", "postalCode": "48201", "country": "US"}',
    '{"correlationId": "corr-003", "traceId": "trace-003"}'
  ),
  -- Scenario 4: In-review mortgage
  (
    'loan0004-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'IN_REVIEW', 'MORTGAGE', 450000, 360, 'Primary residence purchase',
    'appl0004', 'Jennifer', 'Davis', 'jennifer.davis@example.com', '+1-555-0404',
    '1982-05-14', 'SSN-004-56-7890', 'EMPLOYED',
    145000, 695, 45000, true, NOW() - INTERVAL '5 days',
    '{"street": "321 Maple Dr", "city": "Seattle", "state": "WA", "postalCode": "98101", "country": "US"}',
    '{"correlationId": "corr-004", "traceId": "trace-004"}'
  ),
  -- Scenario 5: Pending auto loan
  (
    'loan0005-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    'PENDING', 'AUTO', 42000, 60, 'New vehicle purchase - 2024 Electric Vehicle',
    'appl0005', 'David', 'Martinez', 'david.martinez@example.com', '+1-555-0505',
    '1993-09-30', 'SSN-005-67-8901', 'EMPLOYED',
    72000, 680, 12000, true, NOW() - INTERVAL '1 day',
    '{"street": "567 Pine Blvd", "city": "Austin", "state": "TX", "postalCode": "78701", "country": "US"}',
    '{"correlationId": "corr-005", "traceId": "trace-005"}'
  )
ON CONFLICT DO NOTHING;

-- Sample AI decisions for seeded loans
INSERT INTO ai_decisions (
  id, loan_request_id, tenant_id, risk_score, risk_level, recommendation,
  confidence, reasoning, risk_factors, model_version, prompt_version, tokens_used, latency_ms
) VALUES
  (
    'aidec001-0000-0000-0000-000000000001',
    'loan0001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    0.12, 'LOW', 'APPROVE', 0.94,
    'Excellent credit score of 750, low DTI ratio, stable employment, KYC verified. Low risk approval recommended.',
    '[{"factor":"credit_score","impact":"POSITIVE","weight":0.30,"description":"Excellent credit score (750)"},{"factor":"employment_stability","impact":"POSITIVE","weight":0.15,"description":"Stable employment history"},{"factor":"kyc_verified","impact":"POSITIVE","weight":0.05,"description":"KYC verification passed"}]',
    'mock-v1', '1.2.0', 847, 412
  ),
  (
    'aidec002-0000-0000-0000-000000000002',
    'loan0002-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    0.68, 'HIGH', 'MANUAL_REVIEW', 0.71,
    'Self-employed with high loan amount triggers manual review. Risk score elevated due to high DTI and loan-to-income ratio.',
    '[{"factor":"debt_to_income_ratio","impact":"NEGATIVE","weight":0.25,"description":"Elevated DTI ratio (42.9%)"},{"factor":"employment_stability","impact":"NEUTRAL","weight":0.10,"description":"Self-employed — income variability considered"}]',
    'mock-v1', '1.2.0', 1124, 891
  )
ON CONFLICT DO NOTHING;

-- Sample audit records
INSERT INTO audit_logs (id, tenant_id, loan_request_id, event_type, actor_type, service_name, payload, trace_id, correlation_id, version, environment, hash, previous_hash) VALUES
  ('audit001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'loan0001-0000-0000-0000-000000000001',
   'LOAN_REQUEST_SUBMITTED', 'USER', 'api-gateway',
   '{"loanType":"PERSONAL","requestedAmount":25000,"applicantEmail":"emily.johnson@example.com"}',
   'trace-001', 'corr-001', '1.0', 'development',
   'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', NULL),
  ('audit002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'loan0001-0000-0000-0000-000000000001',
   'WORKFLOW_STARTED', 'SYSTEM', 'workflow-service',
   '{"workflowId":"loan-loan0001-0000-0000-0000-000000000001","taskQueue":"loan-approval"}',
   'trace-001', 'corr-001', '1.0', 'development',
   'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
   'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
  ('audit003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'loan0001-0000-0000-0000-000000000001',
   'LOAN_APPROVED', 'AI', 'workflow-service',
   '{"decidedBy":"AI","riskScore":0.12,"riskLevel":"LOW","recommendation":"APPROVE"}',
   'trace-001', 'corr-001', '1.0', 'development',
   'b14a7b8059d9c055954c92674ce60032a786cbeece6fec5c0fc47af6694d7a7b',
   'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3')
ON CONFLICT DO NOTHING;
