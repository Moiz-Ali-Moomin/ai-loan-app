import { Injectable } from '@nestjs/common';
import type { DatabasePool as Pool } from '@loan-platform/database';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type { RetrievalResult } from '../schemas/decision.schema';

const logger = createLogger('decision-service:retrieval');

export interface RetrievalOptions {
  tenantId: string;
  queryText: string;
  documentTypes?: string[];
  jurisdiction?: string;
  topK?: number;
  similarityThreshold?: number;
}

export interface RetrievalOutput {
  results: RetrievalResult[];
  contextAddendum: string;
  retrievalLatencyMs: number;
  qualityScore: number;
}

const DOCUMENT_TYPE_PRIORITY: Record<string, number> = {
  kyc_guideline: 1,
  aml_policy: 1,
  sanctions_policy: 1,
  risk_policy: 2,
  underwriting_sop: 2,
  compliance_manual: 3,
  credit_policy: 3,
};

@Injectable()
export class RAGRetriever {
  private readonly topK: number;
  private readonly similarityThreshold: number;

  constructor(private readonly pool: Pool) {
    this.topK = parseInt(process.env['RAG_TOP_K'] ?? '8', 10);
    this.similarityThreshold = parseFloat(process.env['RAG_SIMILARITY_THRESHOLD'] ?? '0.72');
  }

  async retrieve(options: RetrievalOptions): Promise<RetrievalOutput> {
    const start = Date.now();

    return withSpan('decision-service', 'retrieval:retrieve', {
      tenantId: options.tenantId,
      topK: options.topK ?? this.topK,
    }, async () => {
      try {
        const embedding = await this.embed(options.queryText);
        if (!embedding) {
          logger.warn('Embedding failed — skipping RAG retrieval', { tenantId: options.tenantId });
          return this.emptyOutput(start);
        }

        const topK = options.topK ?? this.topK;
        const threshold = options.similarityThreshold ?? this.similarityThreshold;

        let query = `
          SELECT
            de.id,
            de.document_type,
            de.title,
            de.chunk_text,
            1 - (de.embedding <=> $1::vector) AS similarity_score,
            de.metadata
          FROM document_embeddings de
          WHERE de.tenant_id = $2
            AND (1 - (de.embedding <=> $1::vector)) >= $3
        `;

        const params: unknown[] = [
          `[${embedding.join(',')}]`,
          options.tenantId,
          threshold,
        ];

        let paramIdx = 4;

        if (options.documentTypes && options.documentTypes.length > 0) {
          query += ` AND de.document_type = ANY($${paramIdx}::text[])`;
          params.push(options.documentTypes);
          paramIdx++;
        }

        if (options.jurisdiction) {
          query += ` AND (de.metadata->>'jurisdiction' IS NULL OR de.metadata->>'jurisdiction' = $${paramIdx})`;
          params.push(options.jurisdiction);
          paramIdx++;
        }

        query += ` ORDER BY similarity_score DESC LIMIT $${paramIdx}`;
        params.push(topK);

        const client = await this.pool.connect();
        let rows: Array<{
          id: string;
          document_type: string;
          title: string;
          chunk_text: string;
          similarity_score: number;
          metadata: Record<string, unknown>;
        }> = [];

        try {
          await client.query('BEGIN');
          await client.query('SET LOCAL ivfflat.probes = 10');
          const result = await client.query(query, params);
          await client.query('COMMIT');
          rows = result.rows as typeof rows;
        } finally {
          client.release();
        }

        const results: RetrievalResult[] = rows
          .sort((a, b) => {
            const pa = DOCUMENT_TYPE_PRIORITY[a.document_type] ?? 99;
            const pb = DOCUMENT_TYPE_PRIORITY[b.document_type] ?? 99;
            if (pa !== pb) return pa - pb;
            return b.similarity_score - a.similarity_score;
          })
          .map(row => ({
            document_id: row.id,
            document_type: row.document_type,
            title: row.title,
            excerpt: row.chunk_text.slice(0, 600),
            similarity_score: row.similarity_score,
            metadata: row.metadata,
          }));

        const contextAddendum = this.buildContextAddendum(results);
        const qualityScore = this.computeQualityScore(results, topK);
        const retrievalLatencyMs = Date.now() - start;

        logger.info('RAG retrieval completed', {
          tenantId: options.tenantId,
          resultCount: results.length,
          qualityScore,
          retrievalLatencyMs,
        });

        return { results, contextAddendum, retrievalLatencyMs, qualityScore };
      } catch (err) {
        logger.error('RAG retrieval failed', { err, tenantId: options.tenantId });
        return this.emptyOutput(start);
      }
    });
  }

  private async embed(text: string): Promise<number[] | null> {
    const fastembedUrl = process.env['FASTEMBED_URL'] ?? 'http://localhost:8000';
    try {
      const resp = await fetch(`${fastembedUrl}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [text] }),
        signal: AbortSignal.timeout(5000),
      });
      if (!resp.ok) return null;
      const data = await resp.json() as { embeddings: number[][] };
      return data.embeddings[0] ?? null;
    } catch {
      return null;
    }
  }

  private buildContextAddendum(results: RetrievalResult[]): string {
    if (results.length === 0) return '';
    const sections = results.map((r, i) =>
      `[${i + 1}] ${r.document_type.toUpperCase()} — ${r.title}\n${r.excerpt}`
    );
    return [
      '=== RETRIEVED REGULATORY & POLICY CONTEXT ===',
      ...sections,
      '=== END RETRIEVED CONTEXT ===',
    ].join('\n\n');
  }

  private computeQualityScore(results: RetrievalResult[], targetK: number): number {
    if (results.length === 0) return 0;
    const coverageRatio = Math.min(results.length / Math.max(targetK / 2, 1), 1);
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity_score, 0) / results.length;
    return parseFloat((coverageRatio * 0.4 + avgSimilarity * 0.6).toFixed(4));
  }

  private emptyOutput(start: number): RetrievalOutput {
    return { results: [], contextAddendum: '', retrievalLatencyMs: Date.now() - start, qualityScore: 0 };
  }
}
