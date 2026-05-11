export interface EmbeddingRequest {
  texts: string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  totalTokens: number;
  latencyMs: number;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  healthCheck(): Promise<boolean>;
}

export interface EmbeddingServiceConfig {
  provider: 'openai' | 'local';
  model: string;
  dimensions: number;
  batchSize: number;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
}
