import './instrumentation.js';
import Fastify from 'fastify';
import { createPool } from '@loan-platform/database';
import { createLogger } from '@loan-platform/logger';
import auditRoutes from './routes/audit.routes.js';

const logger = createLogger('audit-service');

declare module 'fastify' {
  interface FastifyInstance {
    pg: ReturnType<typeof createPool>;
  }
}

async function buildServer() {
  const fastify = Fastify({ logger: { level: 'info' }, genReqId: () => crypto.randomUUID() });

  const pool = createPool();
  fastify.decorate('pg', pool);

  await fastify.register(auditRoutes, { prefix: '/api/v1' });

  fastify.get('/health', async (_, reply) => {
    try { await pool.query('SELECT 1'); return reply.send({ status: 'healthy', service: 'audit-service' }); }
    catch { return reply.status(503).send({ status: 'unhealthy' }); }
  });

  fastify.get('/metrics', async (_, reply) => reply.type('text/plain').send('# audit-service metrics\n'));

  const shutdown = async () => { await pool.end(); await fastify.close(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  return fastify;
}

async function main() {
  const server = await buildServer();
  const port = parseInt(process.env['PORT'] ?? '3004', 10);
  await server.listen({ port, host: '0.0.0.0' });
  logger.info(`Audit Service listening on port ${port}`);
}

main().catch((err) => { logger.fatal('Failed to start audit service', { err }); process.exit(1); });
