import { randomUUID, createHash } from 'crypto';
import type { Pool } from 'pg';
import { createLogger } from '@loan-platform/logger';
import { withSpan, createHistogram, createCounter } from '@loan-platform/telemetry';
import type {
  DocumentChunk,
  DocumentMetadata,
  DocumentType,
  RetrievedChunk,
  VectorSearchRequest,
  VectorSearchResult,
  EmbeddingDeleteRequest,
  EmbeddingDeleteResult,
} from '@loan-platform/shared-types';

const logger = createLogger('ai-execution:vector-repository');

const queryLatency = createHistogram('rag_vector_query_latency_ms', 'pgvector similarity search latency ms', ['operation']);
const retrievalHits = createCounter('rag_retrieval_hits_total', 'Total chunks returned by vector search', []);
const ingestionRows = createCounter('rag_ingestion_rows_total', 'Total chunk rows inserted', []);

// ── pgvector formatting helper ────────────────────────────────
function pgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

// ── Build the metadata filter clause ─────────────────────────
// Only @> (containment) is safe against injection when the value
// is JSON-serialized and passed as a parameterised bind variable.
function buildMetadataClause(
  filter: Record<string, unknown> | undefined,
  jurisdiction: string | undefined,
  policyVersion: string | undefined,
  paramOffset: number,
): { clause: string; params: unknown[]; nextParam: number } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = paramOffset;

  if (jurisdiction) {
    conditions.push(`metadata @> $${idx}::jsonb`);
    params.push(JSON.stringify({ jurisdiction }));
    idx++;
  }
  if (policyVersion) {
    conditions.push(`metadata @> $${idx}::jsonb`);
    params.push(JSON.stringify({ policyVersion }));
    idx++;
  }
  if (filter && Object.keys(filter).length > 0) {
    conditions.push(`metadata @> $${idx}::jsonb`);
    params.push(JSON.stringify(filter));
    idx++;
  }

  return {
    clause: conditions.length > 0 ? conditions.map(c => `AND ${c}`).join('\n') : '',
    params,
    nextParam: idx,
  };
}

export class VectorRepository {
  constructor(private readonly pool: Pool) {}

  // ── INSERT a batch of chunks in a single transaction ────────
  async insertChunks(chunks: Array<{
    tenantId: string;
    documentType: DocumentType;
    source?: string;
    title?: string;
    content: string;
    chunkIndex: number;
    embedding: number[];
    metadata?: DocumentMetadata;
  }>): Promise<string[]> {
    return withSpan('ai-execution-service', 'vector-repo:insertChunks', { count: chunks.length }, async () => {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        const ids: string[] = [];
        for (const chunk of chunks) {
          const id = randomUUID();
          ids.push(id);

          await client.query(
            `INSERT INTO document_embeddings
               (id, tenant_id, document_type, source, title, content, chunk_index, embedding, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, $9::jsonb)`,
            [
              id,
              chunk.tenantId,
              chunk.documentType,
              chunk.source ?? null,
              chunk.title ?? null,
              chunk.content,
              chunk.chunkIndex,
              pgVector(chunk.embedding),
              chunk.metadata ? JSON.stringify(chunk.metadata) : null,
            ],
          );
        }

        await client.query('COMMIT');
        ingestionRows.add(chunks.length);

        logger.info('Chunks inserted', {
          count: chunks.length,
          tenantId: chunks[0]?.tenantId,
          documentType: chunks[0]?.documentType,
        });

        return ids;
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error('Chunk insert transaction rolled back', { err });
        throw err;
      } finally {
        client.release();
      }
    });
  }

  // ── SEMANTIC SEARCH with mandatory tenant isolation ──────────
  //
  // IVFFLAT uses approximate nearest-neighbour search. The planner
  // will apply scalar filters (tenant_id, document_type) before the
  // vector scan. Setting ivfflat.probes at session level controls
  // recall vs speed tradeoff (higher = more recall, higher cost).
  //
  // IMPORTANT: tenant_id filter is always prepended — cross-tenant
  // retrieval is structurally impossible through this method.
  async semanticSearch(request: VectorSearchRequest & { queryEmbedding: number[] }): Promise<VectorSearchResult> {
    return withSpan('ai-execution-service', 'vector-repo:semanticSearch', { tenantId: request.tenantId }, async () => {
      const start = Date.now();
      const topK = request.topK ?? 8;
      const threshold = request.similarityThreshold ?? 0.72;

      // Base params: tenantId (1), embedding (2), threshold (3), topK (4)
      const baseParams: unknown[] = [
        request.tenantId,
        pgVector(request.queryEmbedding),
        1 - threshold,      // cosine *distance* threshold (lower = more similar)
        topK,
      ];
      let paramIdx = 5;

      // document_type IN (...) clause
      let typeClause = '';
      if (request.documentTypes && request.documentTypes.length > 0) {
        const placeholders = request.documentTypes.map((_, i) => `$${paramIdx + i}`).join(', ');
        typeClause = `AND document_type IN (${placeholders})`;
        baseParams.push(...request.documentTypes);
        paramIdx += request.documentTypes.length;
      }

      // metadata filter clauses
      const { clause: metaClause, params: metaParams } = buildMetadataClause(
        request.metadataFilter,
        request.jurisdiction,
        request.policyVersion,
        paramIdx,
      );
      baseParams.push(...metaParams);

      const sql = `
        SET LOCAL ivfflat.probes = 10;

        SELECT
          id,
          tenant_id,
          document_type,
          source,
          title,
          content,
          chunk_index,
          metadata,
          created_at,
          1 - (embedding <=> $2::vector) AS similarity_score
        FROM document_embeddings
        WHERE tenant_id = $1
          AND (embedding <=> $2::vector) < $3
          ${typeClause}
          ${metaClause}
        ORDER BY embedding <=> $2::vector
        LIMIT $4
      `;

      const { rows } = await this.pool.query(sql, baseParams);
      const searchLatencyMs = Date.now() - start;

      queryLatency.record(searchLatencyMs, { operation: 'semantic_search' });
      retrievalHits.add(rows.length);

      const chunks: RetrievedChunk[] = rows.map((r: Record<string, unknown>) => ({
        id: String(r['id']),
        tenantId: String(r['tenant_id']),
        documentType: String(r['document_type']) as DocumentType,
        source: r['source'] ? String(r['source']) : undefined,
        title: r['title'] ? String(r['title']) : undefined,
        content: String(r['content']),
        chunkIndex: Number(r['chunk_index']),
        similarityScore: Number(r['similarity_score']),
        metadata: r['metadata'] as DocumentMetadata | undefined,
        createdAt: String(r['created_at']),
      }));

      // Retrieve audit id will be written by the caller after DB insert
      return {
        chunks,
        totalFound: chunks.length,
        queryEmbeddingLatencyMs: 0,    // filled by RetrievalService
        searchLatencyMs,
        retrievalAuditId: '',           // filled by RetrievalService
      };
    });
  }

  // ── Write retrieval audit record ─────────────────────────────
  async writeRetrievalAudit(params: {
    tenantId: string;
    requesterId?: string;
    requesterType: string;
    serviceName: string;
    queryHash: string;
    documentTypes: string[];
    metadataFilter?: Record<string, unknown>;
    retrievedCount: number;
    retrievedDocIds: string[];
    similarityScores: number[];
    topK: number;
    similarityThreshold: number;
    latencyMs: number;
    traceId?: string;
    correlationId?: string;
  }): Promise<string> {
    const id = randomUUID();
    await this.pool.query(
      `INSERT INTO vector_retrieval_audit (
         id, tenant_id, requester_id, requester_type, service_name,
         query_hash, document_types, metadata_filter,
         retrieved_count, retrieved_doc_ids, similarity_scores,
         top_k, similarity_threshold, latency_ms, trace_id, correlation_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        id,
        params.tenantId,
        params.requesterId ?? null,
        params.requesterType,
        params.serviceName,
        params.queryHash,
        params.documentTypes,
        params.metadataFilter ? JSON.stringify(params.metadataFilter) : null,
        params.retrievedCount,
        params.retrievedDocIds,
        params.similarityScores,
        params.topK,
        params.similarityThreshold,
        params.latencyMs,
        params.traceId ?? null,
        params.correlationId ?? null,
      ],
    );
    return id;
  }

  // ── Create ingestion job record ───────────────────────────────
  async createIngestionJob(params: {
    tenantId: string;
    documentType: DocumentType;
    source: string;
    title?: string;
    totalChunks: number;
    metadata?: DocumentMetadata;
    initiatedBy?: string;
  }): Promise<string> {
    const id = randomUUID();
    await this.pool.query(
      `INSERT INTO embedding_ingestion_jobs
         (id, tenant_id, document_type, source, title, total_chunks, metadata, initiated_by, status, started_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'processing', NOW())`,
      [
        id,
        params.tenantId,
        params.documentType,
        params.source,
        params.title ?? null,
        params.totalChunks,
        params.metadata ? JSON.stringify(params.metadata) : null,
        params.initiatedBy ?? null,
      ],
    );
    return id;
  }

  // ── Update ingestion job on completion ───────────────────────
  async completeIngestionJob(
    jobId: string,
    processedChunks: number,
    failedChunks: number,
    errorMessage?: string,
  ): Promise<void> {
    const status = failedChunks === 0 ? 'completed' : processedChunks > 0 ? 'partial' : 'failed';
    await this.pool.query(
      `UPDATE embedding_ingestion_jobs
       SET status = $1, processed_chunks = $2, failed_chunks = $3,
           error_message = $4, completed_at = NOW(), updated_at = NOW()
       WHERE id = $5`,
      [status, processedChunks, failedChunks, errorMessage ?? null, jobId],
    );
  }

  // ── DELETE chunks (by ids, by source, or by document_type) ──
  // Always scoped to tenant_id for isolation.
  async deleteChunks(request: EmbeddingDeleteRequest): Promise<EmbeddingDeleteResult> {
    return withSpan('ai-execution-service', 'vector-repo:deleteChunks', { tenantId: request.tenantId }, async () => {
      const conditions = ['tenant_id = $1'];
      const params: unknown[] = [request.tenantId];
      let idx = 2;

      if (request.ids && request.ids.length > 0) {
        const placeholders = request.ids.map((_, i) => `$${idx + i}`).join(', ');
        conditions.push(`id IN (${placeholders})`);
        params.push(...request.ids);
        idx += request.ids.length;
      }
      if (request.documentType) {
        conditions.push(`document_type = $${idx}`);
        params.push(request.documentType);
        idx++;
      }
      if (request.source) {
        conditions.push(`source = $${idx}`);
        params.push(request.source);
        idx++;
      }

      const { rowCount } = await this.pool.query(
        `DELETE FROM document_embeddings WHERE ${conditions.join(' AND ')}`,
        params,
      );

      logger.info('Document embeddings deleted', {
        tenantId: request.tenantId,
        deletedCount: rowCount,
        documentType: request.documentType,
        source: request.source,
      });

      return { deletedCount: rowCount ?? 0 };
    });
  }

  // ── Run ANALYZE after large batch ingestion ──────────────────
  async analyzeTable(): Promise<void> {
    await this.pool.query('ANALYZE document_embeddings');
    logger.info('ANALYZE completed on document_embeddings');
  }

  // ── Get chunk by id (tenant-scoped) ─────────────────────────
  async getChunkById(id: string, tenantId: string): Promise<DocumentChunk | null> {
    const { rows } = await this.pool.query(
      `SELECT id, tenant_id, document_type, source, title, content,
              chunk_index, metadata, created_at
       FROM document_embeddings
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId],
    );
    if (rows.length === 0) return null;
    const r = rows[0] as Record<string, unknown>;
    return {
      id: String(r['id']),
      tenantId: String(r['tenant_id']),
      documentType: String(r['document_type']) as DocumentType,
      source: r['source'] ? String(r['source']) : undefined,
      title: r['title'] ? String(r['title']) : undefined,
      content: String(r['content']),
      chunkIndex: Number(r['chunk_index']),
      metadata: r['metadata'] as DocumentMetadata | undefined,
      createdAt: String(r['created_at']),
    };
  }

  // ── Count chunks per tenant (for health/metrics) ─────────────
  async countChunks(tenantId: string): Promise<number> {
    const { rows } = await this.pool.query(
      'SELECT COUNT(*)::int AS cnt FROM document_embeddings WHERE tenant_id = $1',
      [tenantId],
    );
    return (rows[0] as Record<string, unknown>)['cnt'] as number ?? 0;
  }
}

export function buildQueryHash(queryText: string): string {
  return createHash('sha256').update(queryText).digest('hex');
}
