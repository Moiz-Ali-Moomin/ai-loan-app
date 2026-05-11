import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import type {
  DocumentIngestionRequest,
  VectorSearchRequest,
  EmbeddingDeleteRequest,
  DocumentType,
} from '@loan-platform/shared-types';
import { IngestionService } from '../rag/ingestion/ingestion-service.js';
import { RetrievalService } from '../rag/retrieval/retrieval-service.js';
import { VectorRepository } from '../rag/repository/vector.repository.js';

const logger = createLogger('ai-execution:embeddings-routes');

// ── Zod-free validation helpers (keep zero extra deps) ────────
function requireString(val: unknown, field: string): string {
  if (typeof val !== 'string' || val.trim() === '') {
    throw new ValidationError(`${field} is required and must be a non-empty string`);
  }
  return val.trim();
}

function optionalStringArray(val: unknown): string[] | undefined {
  if (val === undefined || val === null) return undefined;
  if (!Array.isArray(val)) throw new ValidationError('Expected an array');
  return val.map(v => String(v));
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ─────────────────────────────────────────────────────────────

export default async function embeddingsRoutes(fastify: FastifyInstance) {
  // ── POST /embeddings/index ────────────────────────────────
  // Ingest a document (chunked, embedded, stored in pgvector)
  fastify.post(
    '/embeddings/index',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
      const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();

      return withSpan('ai-execution-service', 'embeddings:index', { traceId }, async () => {
        const body = request.body as Record<string, unknown>;

        // ── Validate ────────────────────────────────────────
        let ingestionRequest: DocumentIngestionRequest;
        try {
          ingestionRequest = {
            tenantId: requireString(body['tenantId'], 'tenantId'),
            documentType: requireString(body['documentType'], 'documentType') as DocumentType,
            source: requireString(body['source'], 'source'),
            title: requireString(body['title'], 'title'),
            content: requireString(body['content'], 'content'),
            metadata: typeof body['metadata'] === 'object' && body['metadata'] !== null
              ? body['metadata'] as DocumentIngestionRequest['metadata']
              : undefined,
            initiatedBy: typeof body['initiatedBy'] === 'string' ? body['initiatedBy'] : undefined,
            chunkSize: typeof body['chunkSize'] === 'number' ? body['chunkSize'] : undefined,
            chunkOverlap: typeof body['chunkOverlap'] === 'number' ? body['chunkOverlap'] : undefined,
          };
        } catch (err) {
          if (err instanceof ValidationError) {
            return reply.status(400).send({ success: false, error: err.message });
          }
          throw err;
        }

        const ingestionService = new IngestionService(fastify.pg);

        let result;
        try {
          result = await ingestionService.ingestDocument(ingestionRequest);
        } catch (err) {
          logger.error('Document ingestion failed', {
            tenantId: ingestionRequest.tenantId,
            source: ingestionRequest.source,
            err,
            traceId,
          });
          return reply.status(500).send({ success: false, error: 'Document ingestion failed' });
        }

        // ── Publish Kafka audit event ─────────────────────
        const producer = fastify.kafkaProducer as KafkaProducerClient;
        await producer.publish(
          KafkaTopic.AUDIT_EVENTS,
          'DOCUMENT_INGESTED',
          {
            jobId: result.jobId,
            tenantId: result.tenantId,
            documentType: result.documentType,
            source: result.source,
            totalChunks: result.totalChunks,
            processedChunks: result.processedChunks,
            status: result.status,
            durationMs: result.durationMs,
          },
          { tenantId: ingestionRequest.tenantId, correlationId, source: 'ai-execution-service' },
        );

        return reply.status(result.status === 'failed' ? 500 : 201).send({
          success: result.status !== 'failed',
          data: result,
        });
      });
    },
  );

  // ── POST /embeddings/search ───────────────────────────────
  // Semantic similarity search with tenant isolation
  fastify.post(
    '/embeddings/search',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
      const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();

      return withSpan('ai-execution-service', 'embeddings:search', { traceId }, async () => {
        const body = request.body as Record<string, unknown>;

        let searchRequest: VectorSearchRequest;
        try {
          searchRequest = {
            tenantId: requireString(body['tenantId'], 'tenantId'),
            queryText: requireString(body['queryText'], 'queryText'),
            documentTypes: optionalStringArray(body['documentTypes']) as DocumentType[] | undefined,
            metadataFilter: typeof body['metadataFilter'] === 'object' && body['metadataFilter'] !== null
              ? body['metadataFilter'] as Record<string, unknown>
              : undefined,
            jurisdiction: typeof body['jurisdiction'] === 'string' ? body['jurisdiction'] : undefined,
            policyVersion: typeof body['policyVersion'] === 'string' ? body['policyVersion'] : undefined,
            topK: typeof body['topK'] === 'number' ? body['topK'] : undefined,
            similarityThreshold: typeof body['similarityThreshold'] === 'number' ? body['similarityThreshold'] : undefined,
            requesterId: typeof body['requesterId'] === 'string' ? body['requesterId'] : undefined,
            requesterType: (['user', 'service', 'workflow'] as const).includes(body['requesterType'] as never)
              ? body['requesterType'] as 'user' | 'service' | 'workflow'
              : 'user',
            serviceName: 'ai-execution-service',
            traceId,
            correlationId,
          };
        } catch (err) {
          if (err instanceof ValidationError) {
            return reply.status(400).send({ success: false, error: err.message });
          }
          throw err;
        }

        const retrieval = new RetrievalService(fastify.pg);

        let result;
        try {
          result = await retrieval.search(searchRequest);
        } catch (err) {
          logger.error('Semantic search failed', { tenantId: searchRequest.tenantId, err, traceId });
          return reply.status(500).send({ success: false, error: 'Semantic search failed' });
        }

        // Publish audit event to Kafka for the compliance stream
        const producer = fastify.kafkaProducer as KafkaProducerClient;
        await producer.publish(
          KafkaTopic.AUDIT_EVENTS,
          'VECTOR_RETRIEVAL_EXECUTED',
          {
            tenantId: searchRequest.tenantId,
            retrievalAuditId: result.retrievalAuditId,
            retrievedCount: result.totalFound,
            documentTypes: searchRequest.documentTypes ?? [],
            topK: searchRequest.topK ?? 8,
            queryEmbeddingLatencyMs: result.queryEmbeddingLatencyMs,
            searchLatencyMs: result.searchLatencyMs,
          },
          { tenantId: searchRequest.tenantId, correlationId, source: 'ai-execution-service' },
        );

        return reply.send({ success: true, data: result });
      });
    },
  );

  // ── POST /embeddings/delete ───────────────────────────────
  // Delete chunks by ids, source, or document_type (tenant-scoped)
  fastify.post(
    '/embeddings/delete',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
      const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();

      return withSpan('ai-execution-service', 'embeddings:delete', { traceId }, async () => {
        const body = request.body as Record<string, unknown>;

        let deleteRequest: EmbeddingDeleteRequest;
        try {
          deleteRequest = {
            tenantId: requireString(body['tenantId'], 'tenantId'),
            documentType: typeof body['documentType'] === 'string'
              ? body['documentType'] as DocumentType
              : undefined,
            source: typeof body['source'] === 'string' ? body['source'] : undefined,
            ids: Array.isArray(body['ids']) ? (body['ids'] as string[]) : undefined,
          };
        } catch (err) {
          if (err instanceof ValidationError) {
            return reply.status(400).send({ success: false, error: err.message });
          }
          throw err;
        }

        if (!deleteRequest.ids && !deleteRequest.source && !deleteRequest.documentType) {
          return reply.status(400).send({
            success: false,
            error: 'At least one of ids, source, or documentType is required',
          });
        }

        const repo = new VectorRepository(fastify.pg);
        const result = await repo.deleteChunks(deleteRequest);

        // Publish Kafka audit event
        const producer = fastify.kafkaProducer as KafkaProducerClient;
        await producer.publish(
          KafkaTopic.AUDIT_EVENTS,
          'DOCUMENT_EMBEDDINGS_DELETED',
          {
            tenantId: deleteRequest.tenantId,
            deletedCount: result.deletedCount,
            documentType: deleteRequest.documentType,
            source: deleteRequest.source,
            idCount: deleteRequest.ids?.length,
          },
          { tenantId: deleteRequest.tenantId, correlationId, source: 'ai-execution-service' },
        );

        logger.info('Embeddings deleted', {
          tenantId: deleteRequest.tenantId,
          deletedCount: result.deletedCount,
          traceId,
        });

        return reply.send({ success: true, data: result });
      });
    },
  );

  // ── GET /embeddings/health ────────────────────────────────
  fastify.get(
    '/embeddings/health',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        await fastify.pg.query('SELECT 1 FROM document_embeddings LIMIT 1');
        return reply.send({
          status: 'healthy',
          vectorExtension: 'pgvector',
          indexStrategy: 'ivfflat',
        });
      } catch (err) {
        return reply.status(503).send({ status: 'unhealthy', error: String(err) });
      }
    },
  );
}
