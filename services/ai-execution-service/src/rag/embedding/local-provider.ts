import { createLogger } from '@loan-platform/logger';
import { createHistogram, createCounter } from '@loan-platform/telemetry';
import type { EmbeddingProvider, EmbeddingRequest, EmbeddingResponse } from './types.js';

const logger = createLogger('ai-execution:embedding:local');

const embeddingLatency = createHistogram('rag', 'rag_local_embedding_latency_ms', { description: 'Local embedding latency ms' });
const embeddingErrors = createCounter('rag', 'rag_local_embedding_errors_total', { description: 'Local embedding errors' });

export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local';
  readonly dimensions: number;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: { model: string; dimensions: number; timeoutMs: number }) {
    this.baseUrl = (process.env['FASTEMBED_URL'] ?? 'http://fastembed:8000').replace(/\/$/, '');
    this.dimensions = config.dimensions;
    this.timeoutMs = config.timeoutMs;
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: request.texts }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        embeddingErrors.add(1);
        throw new Error(`FastEmbed server error ${response.status}: ${text}`);
      }

      const data = await response.json() as FastEmbedResponse;
      const latencyMs = Date.now() - start;

      embeddingLatency.record(latencyMs);

      logger.debug('Local embeddings generated', {
        model: data.model,
        inputCount: request.texts.length,
        dimensions: data.dimensions,
        latencyMs,
      });

      return {
        embeddings: data.embeddings,
        model: data.model,
        totalTokens: 0,   // local model has no token billing
        latencyMs,
      };
    } catch (err) {
      embeddingErrors.add(1);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      return res.ok;
    } catch {
      return false;
    }
  }
}

interface FastEmbedResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
}
