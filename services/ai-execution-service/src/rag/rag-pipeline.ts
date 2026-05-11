import type { Pool } from 'pg';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type { RAGContext, DocumentType } from '@loan-platform/shared-types';
import { RetrievalService } from './retrieval/retrieval-service.js';

const logger = createLogger('ai-execution:rag-pipeline');

export interface RAGQueryOptions {
  tenantId: string;
  queryText: string;
  documentTypes?: DocumentType[];
  jurisdiction?: string;
  policyVersion?: string;
  requesterId?: string;
  requesterType?: 'user' | 'service' | 'workflow';
  traceId?: string;
  correlationId?: string;
  topK?: number;
  similarityThreshold?: number;
  maxContextTokens?: number;
}

export interface RAGEnrichedPrompt {
  originalQuery: string;
  enrichedSystemAddendum: string;   // injected into the system prompt
  ragContext: RAGContext;
  hasContext: boolean;
}

// ── System addendum template ────────────────────────────────────
// This is appended to the existing system prompt when RAG context
// is available. Keeping it as a separate addendum (rather than
// prepending to user message) ensures the LLM sees it as
// authoritative policy guidance with higher weight.
function buildSystemAddendum(context: RAGContext): string {
  if (!context.assembledContext || context.chunks.length === 0) return '';

  const sourceList = context.sourceDocs.map(s => `  - ${s}`).join('\n');

  return `
## Relevant Compliance & Policy Context

The following excerpts have been retrieved from the platform's internal compliance knowledge base.
You MUST consider this context when forming your assessment. Cite specific policies where applicable.
All policy references are authoritative for this institution.

${context.assembledContext}

Referenced documents:
${sourceList}

(Context retrieved via semantic search — ${context.chunks.length} passages, ~${context.tokenEstimate} tokens)
`.trim();
}

export class RAGPipeline {
  private readonly retrieval: RetrievalService;

  constructor(pool: Pool) {
    this.retrieval = new RetrievalService(pool);
  }

  async enrichQuery(options: RAGQueryOptions): Promise<RAGEnrichedPrompt> {
    return withSpan(
      'ai-execution-service',
      'rag:enrichQuery',
      { tenantId: options.tenantId },
      async () => {
        const topK = options.topK ?? parseInt(process.env['RAG_TOP_K'] ?? '8', 10);
        const threshold = options.similarityThreshold
          ?? parseFloat(process.env['RAG_SIMILARITY_THRESHOLD'] ?? '0.72');
        const maxContextTokens = options.maxContextTokens
          ?? parseInt(process.env['RAG_MAX_CONTEXT_TOKENS'] ?? '6000', 10);

        let ragContext: RAGContext;
        try {
          ragContext = await this.retrieval.assembleRAGContext({
            tenantId: options.tenantId,
            queryText: options.queryText,
            documentTypes: options.documentTypes,
            jurisdiction: options.jurisdiction,
            policyVersion: options.policyVersion,
            requesterId: options.requesterId,
            requesterType: options.requesterType ?? 'service',
            serviceName: 'ai-execution-service',
            traceId: options.traceId,
            correlationId: options.correlationId,
            topK,
            similarityThreshold: threshold,
            maxContextTokens,
          });
        } catch (err) {
          // RAG is advisory — if retrieval fails, the LLM still executes with
          // its base knowledge. The failure is logged for observability but does
          // not block the primary AI decision path.
          logger.warn('RAG retrieval failed, proceeding without context', {
            tenantId: options.tenantId,
            err: err instanceof Error ? err.message : String(err),
          });

          return {
            originalQuery: options.queryText,
            enrichedSystemAddendum: '',
            ragContext: {
              query: options.queryText,
              chunks: [],
              assembledContext: '',
              tokenEstimate: 0,
              sourceDocs: [],
              retrievalAuditId: '',
            },
            hasContext: false,
          };
        }

        const hasContext = ragContext.chunks.length > 0;
        const addendum = hasContext ? buildSystemAddendum(ragContext) : '';

        logger.info('RAG enrichment complete', {
          tenantId: options.tenantId,
          hasContext,
          chunks: ragContext.chunks.length,
          tokenEstimate: ragContext.tokenEstimate,
          sourceDocs: ragContext.sourceDocs,
          retrievalAuditId: ragContext.retrievalAuditId,
        });

        return {
          originalQuery: options.queryText,
          enrichedSystemAddendum: addendum,
          ragContext,
          hasContext,
        };
      },
    );
  }
}
