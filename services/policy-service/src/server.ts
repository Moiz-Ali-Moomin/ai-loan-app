import './instrumentation.js';
import Fastify from 'fastify';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaProducerClient, ensureTopicsExist } from '@loan-platform/kafka';
import { createLogger } from '@loan-platform/logger';
import policyRoutes from './routes/policy.routes.js';

const logger = createLogger('policy-service');

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

  const kafka = createKafkaClient('policy-service');
  await ensureTopicsExist(kafka);
  const producer = new KafkaProducerClient(kafka);
  await producer.connect();
  fastify.decorate('kafkaProducer', producer);

  await fastify.register(policyRoutes, { prefix: '/api/v1' });

  fastify.get('/health', async (_, reply) => {
    try { await pool.query('SELECT 1'); return reply.send({ status: 'healthy', service: 'policy-service' }); }
    catch { return reply.status(503).send({ status: 'unhealthy' }); }
  });

  fastify.get('/metrics', async (_, reply) => reply.type('text/plain').send('# policy-service metrics\n'));

  const shutdown = async () => {
    await producer.disconnect();
    await pool.end();
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return fastify;
}

async function main() {
  const server = await buildServer();
  const port = parseInt(process.env['PORT'] ?? '3002', 10);
  await server.listen({ port, host: '0.0.0.0' });
  logger.info(`Policy Service listening on port ${port}`);
}

main().catch((err) => { logger.fatal('Failed to start policy service', { err }); process.exit(1); });
