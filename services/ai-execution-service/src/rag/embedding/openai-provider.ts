import { createLogger } from '@loan-platform/logger';
import { createHistogram, createCounter } from '@loan-platform/telemetry';
import type { EmbeddingProvider, EmbeddingRequest, EmbeddingResponse } from './types.js';

const logger = createLogger('ai-execution:embedding:openai');

const embeddingLatency = createHistogram('rag_embedding_latency_ms', 'Embedding API call latency in ms', ['provider', 'model']);
const embeddingTokens = createCounter('rag_embedding_tokens_total', 'Total tokens consumed by embedding calls', ['provider', 'model']);
const embeddingErrors = createCounter('rag_embedding_errors_total', 'Total embedding API errors', ['provider', 'error_type']);

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';
  readonly dimensions: number;
  private readonly model: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: { model: string; dimensions: number; timeoutMs: number }) {
    const key = process.env['OPENAI_API_KEY'];
    if (!key) throw new Error('OPENAI_API_KEY is required for OpenAI embedding provider');
    this.apiKey = key;
    this.model = config.model;
    this.dimensions = config.dimensions;
    this.timeoutMs = config.timeoutMs;
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const model = request.model ?? this.model;
    const start = Date.now();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const body: Record<string, unknown> = {
        model,
        input: request.texts,
        encoding_format: 'float',
      };

      // text-embedding-3-* supports dimension truncation
      if (model.startsWith('text-embedding-3')) {
        body['dimensions'] = this.dimensions;
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        const isRateLimit = response.status === 429;
        embeddingErrors.add(1, { provider: this.name, error_type: isRateLimit ? 'rate_limit' : 'api_error' });
        const err = new OpenAIEmbeddingError(
          `OpenAI embeddings API error ${response.status}: ${errorText}`,
          response.status,
          isRateLimit,
        );
        throw err;
      }

      const data = await response.json() as OpenAIEmbeddingAPIResponse;
      const latencyMs = Date.now() - start;

      embeddingLatency.record(latencyMs, { provider: this.name, model });
      embeddingTokens.add(data.usage.total_tokens, { provider: this.name, model });

      const embeddings = data.data
        .sort((a, b) => a.index - b.index)
        .map(d => d.embedding);

      logger.debug('OpenAI embeddings generated', {
        model,
        inputCount: request.texts.length,
        totalTokens: data.usage.total_tokens,
        latencyMs,
      });

      return {
        embeddings,
        model,
        totalTokens: data.usage.total_tokens,
        latencyMs,
      };
    } catch (err) {
      if (!(err instanceof OpenAIEmbeddingError)) {
        embeddingErrors.add(1, { provider: this.name, error_type: 'network' });
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.embed({ texts: ['health check'] });
      return true;
    } catch {
      return false;
    }
  }
}

export class OpenAIEmbeddingError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly isRateLimit: boolean,
  ) {
    super(message);
    this.name = 'OpenAIEmbeddingError';
  }
}

interface OpenAIEmbeddingAPIResponse {
  data: Array<{ index: number; embedding: number[] }>;
  usage: { prompt_tokens: number; total_tokens: number };
}
