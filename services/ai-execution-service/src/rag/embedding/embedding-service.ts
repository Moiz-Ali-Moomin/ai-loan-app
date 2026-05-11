import { createLogger } from '@loan-platform/logger';
import { withSpan, createHistogram, createCounter } from '@loan-platform/telemetry';
import { OpenAIEmbeddingProvider, OpenAIEmbeddingError } from './openai-provider.js';
import { LocalEmbeddingProvider } from './local-provider.js';
import type { EmbeddingProvider, EmbeddingServiceConfig } from './types.js';

const logger = createLogger('ai-execution:embedding-service');

const batchLatency = createHistogram('rag', 'rag_embedding_batch_latency_ms', { description: 'End-to-end batch embedding latency ms' });
const batchSize = createHistogram('rag', 'rag_embedding_batch_size', { description: 'Documents per embedding batch' });
const retryCount = createCounter('rag', 'rag_embedding_retries_total', { description: 'Total embedding retries' });
// ObservableGauge is callback-based in OTEL SDK — we track via counter proxy
const ingestionStartCounter = createCounter('rag', 'rag_ingestion_started_total', { description: 'Ingestion operations started' });
const ingestionEndCounter = createCounter('rag', 'rag_ingestion_ended_total', { description: 'Ingestion operations ended' });

function loadConfig(): EmbeddingServiceConfig {
  return {
    provider: (process.env['EMBEDDING_PROVIDER'] ?? 'openai') as 'openai' | 'local',
    model: process.env['EMBEDDING_MODEL'] ?? 'text-embedding-3-small',
    dimensions: parseInt(process.env['EMBEDDING_DIMENSIONS'] ?? '1024', 10),
    batchSize: parseInt(process.env['EMBEDDING_BATCH_SIZE'] ?? '32', 10),
    maxRetries: parseInt(process.env['EMBEDDING_MAX_RETRIES'] ?? '3', 10),
    retryDelayMs: parseInt(process.env['EMBEDDING_RETRY_DELAY_MS'] ?? '1000', 10),
    timeoutMs: parseInt(process.env['EMBEDDING_TIMEOUT_MS'] ?? '30000', 10),
  };
}

function buildProvider(config: EmbeddingServiceConfig): EmbeddingProvider {
  if (config.provider === 'openai') {
    return new OpenAIEmbeddingProvider({
      model: config.model,
      dimensions: config.dimensions,
      timeoutMs: config.timeoutMs,
    });
  }
  if (config.provider === 'local') {
    return new LocalEmbeddingProvider({
      model: config.model,
      dimensions: config.dimensions,
      timeoutMs: config.timeoutMs,
    });
  }
  throw new Error(`Unsupported embedding provider: ${config.provider}`);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelayMs: number,
  providerName: string,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;

      const isRateLimit = err instanceof OpenAIEmbeddingError && err.isRateLimit;
      // Exponential backoff; extra penalty for rate-limit responses
      const delay = baseDelayMs * Math.pow(2, attempt) * (isRateLimit ? 3 : 1);

      retryCount.add(1, { provider: providerName });
      logger.warn('Embedding attempt failed, retrying', {
        attempt: attempt + 1,
        maxRetries,
        delayMs: delay,
        isRateLimit,
        err: err instanceof Error ? err.message : String(err),
      });
      await sleep(delay);
    }
  }
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Embeds an array of text strings, automatically splitting into batches.
 * Returns embeddings in the same order as input texts.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const config = loadConfig();
  const provider = buildProvider(config);

  return withSpan('ai-execution-service', 'embedding:embedTexts', { count: texts.length }, async () => {
    ingestionStartCounter.add(1);
    const start = Date.now();
    const allEmbeddings: number[][] = new Array(texts.length);

    try {
      // Split into batches
      for (let i = 0; i < texts.length; i += config.batchSize) {
        const batch = texts.slice(i, i + config.batchSize);
        batchSize.record(batch.length, { provider: provider.name });

        const batchStart = Date.now();
        const result = await withRetry(
          () => provider.embed({ texts: batch, model: config.model }),
          config.maxRetries,
          config.retryDelayMs,
          provider.name,
        );
        batchLatency.record(Date.now() - batchStart, { provider: provider.name });

        for (let j = 0; j < result.embeddings.length; j++) {
          allEmbeddings[i + j] = result.embeddings[j]!;
        }
      }

      logger.info('Batch embedding complete', {
        totalTexts: texts.length,
        batches: Math.ceil(texts.length / config.batchSize),
        durationMs: Date.now() - start,
        provider: provider.name,
        model: config.model,
      });

      return allEmbeddings;
    } finally {
      ingestionEndCounter.add(1);
    }
  });
}

/**
 * Embeds a single query string. Optimized path for retrieval.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const config = loadConfig();
  const provider = buildProvider(config);

  return withSpan('ai-execution-service', 'embedding:embedQuery', {}, async () => {
    const result = await withRetry(
      () => provider.embed({ texts: [text], model: config.model }),
      config.maxRetries,
      config.retryDelayMs,
      provider.name,
    );
    return result.embeddings[0]!;
  });
}

export function getEmbeddingDimensions(): number {
  return parseInt(process.env['EMBEDDING_DIMENSIONS'] ?? '1024', 10);
}

export async function embeddingProviderHealthCheck(): Promise<boolean> {
  try {
    const config = loadConfig();
    const provider = buildProvider(config);
    return provider.healthCheck();
  } catch {
    return false;
  }
}
