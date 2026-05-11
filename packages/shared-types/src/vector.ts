// ============================================================
// Vector / RAG shared types
// Used by ai-execution-service (ingestion, retrieval, RAG)
// ============================================================

// ── Document types ingested into the vector store ───────────
export type DocumentType =
  | 'kyc_guideline'
  | 'aml_policy'
  | 'onboarding_sop'
  | 'risk_policy'
  | 'compliance_manual'
  | 'regulation'
  | 'internal_memo'
  | 'product_policy';

// ── Embedding providers ──────────────────────────────────────
export type EmbeddingProvider = 'openai' | 'local';

// ── Metadata attached to every document chunk ───────────────
export interface DocumentMetadata {
  jurisdiction?: string;          // e.g. 'IN', 'US', 'EU'
  policyVersion?: string;         // e.g. '2024-Q1'
  effectiveDate?: string;         // ISO date string
  expiryDate?: string;
  author?: string;
  regulatoryBody?: string;        // e.g. 'RBI', 'FinCEN', 'FATF'
  tags?: string[];
  language?: string;              // ISO 639-1 code
  confidentiality?: 'public' | 'internal' | 'restricted' | 'confidential';
  [key: string]: unknown;
}

// ── Single document chunk as stored in document_embeddings ──
export interface DocumentChunk {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  source?: string;
  title?: string;
  content: string;
  chunkIndex: number;
  embedding?: number[];
  metadata?: DocumentMetadata;
  createdAt: string;
}

// ── Ingestion request ────────────────────────────────────────
export interface DocumentIngestionRequest {
  tenantId: string;
  documentType: DocumentType;
  source: string;
  title: string;
  content: string;                // raw full-document text
  metadata?: DocumentMetadata;
  initiatedBy?: string;           // user UUID
  chunkSize?: number;             // default 512 tokens
  chunkOverlap?: number;          // default 64 tokens
}

export interface IngestionResult {
  jobId: string;
  tenantId: string;
  documentType: DocumentType;
  source: string;
  totalChunks: number;
  processedChunks: number;
  failedChunks: number;
  status: 'completed' | 'partial' | 'failed';
  durationMs: number;
}

// ── Retrieval request / response ─────────────────────────────
export interface VectorSearchRequest {
  tenantId: string;
  queryText: string;
  documentTypes?: DocumentType[];
  metadataFilter?: Record<string, unknown>;
  jurisdiction?: string;
  policyVersion?: string;
  topK?: number;                  // default 8
  similarityThreshold?: number;  // default 0.72
  includeEmbedding?: boolean;
  requesterId?: string;
  requesterType?: 'user' | 'service' | 'workflow';
  serviceName?: string;
  traceId?: string;
  correlationId?: string;
}

export interface RetrievedChunk {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  source?: string;
  title?: string;
  content: string;
  chunkIndex: number;
  similarityScore: number;
  metadata?: DocumentMetadata;
  createdAt: string;
}

export interface VectorSearchResult {
  chunks: RetrievedChunk[];
  totalFound: number;
  queryEmbeddingLatencyMs: number;
  searchLatencyMs: number;
  retrievalAuditId: string;
}

// ── RAG context assembly ─────────────────────────────────────
export interface RAGContext {
  query: string;
  chunks: RetrievedChunk[];
  assembledContext: string;       // formatted text injected into the prompt
  tokenEstimate: number;
  sourceDocs: string[];           // deduplicated source references
  retrievalAuditId: string;
}

// ── Delete request ───────────────────────────────────────────
export interface EmbeddingDeleteRequest {
  tenantId: string;
  documentType?: DocumentType;
  source?: string;
  ids?: string[];
}

export interface EmbeddingDeleteResult {
  deletedCount: number;
}
