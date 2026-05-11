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
