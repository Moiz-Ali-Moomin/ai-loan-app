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
