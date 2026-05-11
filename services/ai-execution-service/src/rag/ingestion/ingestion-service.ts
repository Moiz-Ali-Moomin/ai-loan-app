import type { Pool } from 'pg';
import { createLogger } from '@loan-platform/logger';
import { withSpan, createHistogram, createCounter } from '@loan-platform/telemetry';
import type { DocumentIngestionRequest, IngestionResult } from '@loan-platform/shared-types';
import { embedTexts } from '../embedding/embedding-service.js';
import { VectorRepository } from '../repository/vector.repository.js';
import { chunkDocument } from './chunker.js';

const logger = createLogger('ai-execution:ingestion-service');

const ingestionDuration = createHistogram('rag_ingestion_duration_ms', 'End-to-end document ingestion duration ms', ['document_type']);
const ingestionChunks = createCounter('rag_ingestion_chunks_total', 'Total chunks ingested', ['document_type', 'status']);
const ingestionDocuments = createCounter('rag_ingestion_documents_total', 'Total documents ingested', ['document_type', 'status']);

// Threshold: run ANALYZE after inserting more than this many rows
const ANALYZE_THRESHOLD = 500;

export class IngestionService {
  private readonly repo: VectorRepository;

  constructor(pool: Pool) {
    this.repo = new VectorRepository(pool);
  }

  async ingestDocument(request: DocumentIngestionRequest): Promise<IngestionResult> {
    return withSpan(
      'ai-execution-service',
      'ingestion:ingestDocument',
      { tenantId: request.tenantId, documentType: request.documentType, source: request.source },
      async () => {
        const start = Date.now();
        logger.info('Starting document ingestion', {
          tenantId: request.tenantId,
          documentType: request.documentType,
          source: request.source,
          title: request.title,
          contentLength: request.content.length,
        });

        // ── 1. Chunk the document ─────────────────────────────
        const textChunks = chunkDocument({
          content: request.content,
          source: request.source,
          title: request.title,
          metadata: request.metadata,
          chunkSize: request.chunkSize,
          chunkOverlap: request.chunkOverlap,
        });

        if (textChunks.length === 0) {
          logger.warn('Document produced zero chunks, skipping', { source: request.source });
          return {
            jobId: '',
            tenantId: request.tenantId,
            documentType: request.documentType,
            source: request.source,
            totalChunks: 0,
            processedChunks: 0,
            failedChunks: 0,
            status: 'failed',
            durationMs: Date.now() - start,
          };
        }

        // ── 2. Create job record for auditability ─────────────
        const jobId = await this.repo.createIngestionJob({
          tenantId: request.tenantId,
          documentType: request.documentType,
          source: request.source,
          title: request.title,
          totalChunks: textChunks.length,
          metadata: request.metadata,
          initiatedBy: request.initiatedBy,
        });

        // ── 3. Generate embeddings for all chunks in batches ──
        const chunkTexts = textChunks.map(c => c.content);
        let embeddings: number[][];
        try {
          embeddings = await embedTexts(chunkTexts);
        } catch (err) {
          await this.repo.completeIngestionJob(jobId, 0, textChunks.length, String(err));
          ingestionChunks.add(textChunks.length, { document_type: request.documentType, status: 'failed' });
          ingestionDocuments.add(1, { document_type: request.documentType, status: 'failed' });
          throw err;
        }

        // ── 4. Persist chunks transactionally ─────────────────
        let processedChunks = 0;
        let failedChunks = 0;

        try {
          const chunkRows = textChunks.map((chunk, i) => ({
            tenantId: request.tenantId,
            documentType: request.documentType,
            source: request.source,
            title: request.title,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            embedding: embeddings[i]!,
            metadata: chunk.metadata,
          }));

          await this.repo.insertChunks(chunkRows);
          processedChunks = textChunks.length;
        } catch (err) {
          failedChunks = textChunks.length;
          await this.repo.completeIngestionJob(jobId, 0, failedChunks, String(err));
          ingestionChunks.add(failedChunks, { document_type: request.documentType, status: 'failed' });
          ingestionDocuments.add(1, { document_type: request.documentType, status: 'failed' });
          throw err;
        }

        // ── 5. Complete job record ────────────────────────────
        await this.repo.completeIngestionJob(jobId, processedChunks, failedChunks);

        // ── 6. ANALYZE when batch is large enough ─────────────
        if (processedChunks >= ANALYZE_THRESHOLD) {
          setImmediate(() => {
            this.repo.analyzeTable().catch(err =>
              logger.warn('Background ANALYZE failed', { err }),
            );
          });
        }

        const durationMs = Date.now() - start;
        const status: IngestionResult['status'] =
          failedChunks === 0 ? 'completed' : processedChunks > 0 ? 'partial' : 'failed';

        ingestionDuration.record(durationMs, { document_type: request.documentType });
        ingestionChunks.add(processedChunks, { document_type: request.documentType, status: 'success' });
        ingestionDocuments.add(1, { document_type: request.documentType, status });

        logger.info('Document ingestion complete', {
          jobId,
          tenantId: request.tenantId,
          documentType: request.documentType,
          source: request.source,
          totalChunks: textChunks.length,
          processedChunks,
          failedChunks,
          durationMs,
        });

        return {
          jobId,
          tenantId: request.tenantId,
          documentType: request.documentType,
          source: request.source,
          totalChunks: textChunks.length,
          processedChunks,
          failedChunks,
          status,
          durationMs,
        };
      },
    );
  }
}
