import './instrumentation.js';
import Fastify from 'fastify';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaProducerClient, ensureTopicsExist } from '@loan-platform/kafka';
import { createLogger } from '@loan-platform/logger';
import aiRoutes from './routes/ai.routes.js';
import embeddingsRoutes from './routes/embeddings.routes.js';
import { embeddingProviderHealthCheck } from './rag/embedding/embedding-service.js';

const logger = createLogger('ai-execution-service');

declare module 'fastify' {
  interface FastifyInstance {
    pg: ReturnType<typeof createPool>;
    kafkaProducer: KafkaProducerClient;
  }
}

async function buildServer() {
  const fastify = Fastify({ logger: { level: 'info' }, genReqId: () => crypto.randomUUID() });

  const pool = createPool();
  fastify.decorate('pg', pool);

  const kafka = createKafkaClient('ai-execution-service');
  await ensureTopicsExist(kafka);
  const producer = new KafkaProducerClient(kafka);
  await producer.connect();
  fastify.decorate('kafkaProducer', producer);

  await fastify.register(aiRoutes, { prefix: '/api/v1' });
  await fastify.register(embeddingsRoutes, { prefix: '/api/v1' });

  fastify.get('/health', async (_, reply) => {
    try {
      await pool.query('SELECT 1');
      const embeddingHealthy = await embeddingProviderHealthCheck().catch(() => false);
      return reply.send({
        status: 'healthy',
        service: 'ai-execution-service',
        mockMode: process.env['AI_MOCK_MODE'] !== 'false',
        embeddingProvider: process.env['EMBEDDING_PROVIDER'] ?? 'openai',
        embeddingProviderHealthy: embeddingHealthy,
      });
    }
    catch { return reply.status(503).send({ status: 'unhealthy' }); }
  });

  fastify.get('/metrics', async (_, reply) => reply.type('text/plain').send('# ai-execution-service metrics\n'));

  const shutdown = async () => { await producer.disconnect(); await pool.end(); await fastify.close(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  return fastify;
}

async function main() {
  const server = await buildServer();
  const port = parseInt(process.env['PORT'] ?? '3003', 10);
  await server.listen({ port, host: '0.0.0.0' });
  logger.info(`AI Execution Service listening on port ${port}`);
}

main().catch((err) => { logger.fatal('Failed to start AI service', { err }); process.exit(1); });
