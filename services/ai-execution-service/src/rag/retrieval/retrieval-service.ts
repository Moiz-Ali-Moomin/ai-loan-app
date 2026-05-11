import type { Pool } from 'pg';
import { createLogger } from '@loan-platform/logger';
import { withSpan, createHistogram } from '@loan-platform/telemetry';
import type {
  VectorSearchRequest,
  VectorSearchResult,
  RetrievedChunk,
  RAGContext,
} from '@loan-platform/shared-types';
import { embedQuery } from '../embedding/embedding-service.js';
import { VectorRepository, buildQueryHash } from '../repository/vector.repository.js';

const logger = createLogger('ai-execution:retrieval-service');

const queryEmbedLatency = createHistogram('rag_query_embed_latency_ms', 'Query embedding latency ms', []);
const contextTokens = createHistogram('rag_context_tokens', 'Estimated tokens in assembled RAG context', []);

// Rough token estimator: ~4 chars per token (GPT-style)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function deduplicateChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  // Remove exact content duplicates (same source + chunkIndex), keeping highest score
  const seen = new Map<string, RetrievedChunk>();
  for (const chunk of chunks) {
    const key = `${chunk.source ?? ''}::${chunk.chunkIndex}`;
    const existing = seen.get(key);
    if (!existing || chunk.similarityScore > existing.similarityScore) {
      seen.set(key, chunk);
    }
  }
  return [...seen.values()].sort((a, b) => b.similarityScore - a.similarityScore);
}

function rankChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  // Re-rank: boost chunks from the same source that appear consecutively
  // (neighbouring chunks from a single document are more coherent).
  const sourceScores = new Map<string, number>();
  for (const c of chunks) {
    const src = c.source ?? 'unknown';
    sourceScores.set(src, (sourceScores.get(src) ?? 0) + c.similarityScore);
  }

  return [...chunks].sort((a, b) => {
    const srcA = sourceScores.get(a.source ?? 'unknown') ?? 0;
    const srcB = sourceScores.get(b.source ?? 'unknown') ?? 0;
    // Primary: individual score; secondary: cumulative source score (document relevance)
    const scoreA = a.similarityScore * 0.7 + (srcA / chunks.length) * 0.3;
    const scoreB = b.similarityScore * 0.7 + (srcB / chunks.length) * 0.3;
    return scoreB - scoreA;
  });
}

function assembleContext(
  chunks: RetrievedChunk[],
  maxContextTokens: number,
): { text: string; tokenEstimate: number; usedChunks: RetrievedChunk[] } {
  const parts: string[] = [];
  const usedChunks: RetrievedChunk[] = [];
  let totalTokens = 0;

  for (const chunk of chunks) {
    const header = `[Source: ${chunk.title ?? chunk.source ?? 'unknown'} | Type: ${chunk.documentType} | Relevance: ${(chunk.similarityScore * 100).toFixed(1)}%]`;
    const segment = `${header}\n${chunk.content}`;
    const tokens = estimateTokens(segment);

    if (totalTokens + tokens > maxContextTokens) break;

    parts.push(segment);
    usedChunks.push(chunk);
    totalTokens += tokens;
  }

  return {
    text: parts.join('\n\n---\n\n'),
    tokenEstimate: totalTokens,
    usedChunks,
  };
}

export class RetrievalService {
  private readonly repo: VectorRepository;

  constructor(pool: Pool) {
    this.repo = new VectorRepository(pool);
  }

  async search(request: VectorSearchRequest): Promise<VectorSearchResult> {
    return withSpan(
      'ai-execution-service',
      'retrieval:search',
      { tenantId: request.tenantId },
      async () => {
        const overallStart = Date.now();

        // ── 1. Embed the query ────────────────────────────────
        const embedStart = Date.now();
        const queryEmbedding = await embedQuery(request.queryText);
        const queryEmbeddingLatencyMs = Date.now() - embedStart;
        queryEmbedLatency.record(queryEmbeddingLatencyMs);

        // ── 2. Vector search with tenant isolation ────────────
        const searchResult = await this.repo.semanticSearch({
          ...request,
          queryEmbedding,
        });

        // ── 3. Deduplicate and rank ───────────────────────────
        const deduped = deduplicateChunks(searchResult.chunks);
        const ranked = rankChunks(deduped);

        // ── 4. Write compliance audit record ─────────────────
        const totalLatencyMs = Date.now() - overallStart;
        const queryHash = buildQueryHash(request.queryText);

        const auditId = await this.repo.writeRetrievalAudit({
          tenantId: request.tenantId,
          requesterId: request.requesterId,
          requesterType: request.requesterType ?? 'service',
          serviceName: request.serviceName ?? 'ai-execution-service',
          queryHash,
          documentTypes: request.documentTypes ?? [],
          metadataFilter: request.metadataFilter,
          retrievedCount: ranked.length,
          retrievedDocIds: ranked.map(c => c.id),
          similarityScores: ranked.map(c => c.similarityScore),
          topK: request.topK ?? 8,
          similarityThreshold: request.similarityThreshold ?? 0.72,
          latencyMs: totalLatencyMs,
          traceId: request.traceId,
          correlationId: request.correlationId,
        });

        logger.info('Retrieval complete', {
          tenantId: request.tenantId,
          queryHash,
          retrieved: ranked.length,
          queryEmbeddingLatencyMs,
          searchLatencyMs: searchResult.searchLatencyMs,
          totalLatencyMs,
          auditId,
        });

        return {
          chunks: ranked,
          totalFound: ranked.length,
          queryEmbeddingLatencyMs,
          searchLatencyMs: searchResult.searchLatencyMs,
          retrievalAuditId: auditId,
        };
      },
    );
  }

  async assembleRAGContext(request: VectorSearchRequest & {
    maxContextTokens?: number;
  }): Promise<RAGContext> {
    return withSpan('ai-execution-service', 'retrieval:assembleRAGContext', {}, async () => {
      const maxContextTokens = request.maxContextTokens
        ?? parseInt(process.env['RAG_MAX_CONTEXT_TOKENS'] ?? '6000', 10);

      const result = await this.search(request);

      const { text, tokenEstimate, usedChunks } = assembleContext(result.chunks, maxContextTokens);

      // Unique source document references for citation
      const sourceDocs = [...new Set(
        usedChunks.map(c => c.source ?? c.title ?? 'unknown').filter(Boolean),
      )];

      contextTokens.record(tokenEstimate);

      logger.info('RAG context assembled', {
        tenantId: request.tenantId,
        chunksUsed: usedChunks.length,
        tokenEstimate,
        sourceDocs,
      });

      return {
        query: request.queryText,
        chunks: usedChunks,
        assembledContext: text,
        tokenEstimate,
        sourceDocs,
        retrievalAuditId: result.retrievalAuditId,
      };
    });
  }
}
