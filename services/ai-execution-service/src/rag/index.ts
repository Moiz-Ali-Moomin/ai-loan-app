// RAG module barrel — import from here for clean external references
export { RAGPipeline } from './rag-pipeline.js';
export type { RAGQueryOptions, RAGEnrichedPrompt } from './rag-pipeline.js';

export { RetrievalService } from './retrieval/retrieval-service.js';
export { IngestionService } from './ingestion/ingestion-service.js';
export { VectorRepository, buildQueryHash } from './repository/vector.repository.js';

export { embedTexts, embedQuery, embeddingProviderHealthCheck, getEmbeddingDimensions } from './embedding/embedding-service.js';
export { chunkDocument } from './ingestion/chunker.js';
export type { ChunkInput, TextChunk } from './ingestion/chunker.js';
