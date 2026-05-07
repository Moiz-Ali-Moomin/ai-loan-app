/**
 * Lightweight HTTP API alongside the Temporal worker.
 * Exposes health, readiness, metrics, and workflow status queries
 * so K8s probes and the API gateway can inspect worker state.
 */
import './instrumentation.js';
import Fastify from 'fastify';
import { Connection, Client } from '@temporalio/client';
import { createPool } from '@loan-platform/database';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('workflow-service:api');

const TEMPORAL_ADDRESS = process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233';
const TEMPORAL_NAMESPACE = process.env['TEMPORAL_NAMESPACE'] ?? 'loan-governance';

async function buildApiServer() {
  const fastify = Fastify({ logger: false, genReqId: () => crypto.randomUUID() });
  const pool = createPool();

  // ── Health / readiness ────────────────────────────────────────
  fastify.get('/health', async (_, reply) => {
    try {
      await pool.query('SELECT 1');
      return reply.send({ status: 'healthy', service: 'workflow-service' });
    } catch {
      return reply.status(503).send({ status: 'unhealthy', service: 'workflow-service' });
    }
  });

  fastify.get('/ready', async (_, reply) => reply.send({ ready: true }));

  fastify.get('/metrics', async (_, reply) =>
    reply.type('text/plain').send('# workflow-service metrics\n')
  );

  // ── Workflow status query ─────────────────────────────────────
  fastify.get(
    '/api/v1/workflows/:loanRequestId',
    async (request: { params: { loanRequestId: string } }, reply) => {
      let connection: Awaited<ReturnType<typeof Connection.connect>> | null = null;
      try {
        connection = await Connection.connect({ address: TEMPORAL_ADDRESS });
        const client = new Client({ connection, namespace: TEMPORAL_NAMESPACE });
        const handle = client.workflow.getHandle(`loan-${request.params.loanRequestId}`);
        const desc = await handle.describe();

        return reply.send({
          success: true,
          data: {
            workflowId: desc.workflowId,
            runId: desc.runId,
            status: desc.status.name,
            startTime: desc.startTime,
            closeTime: desc.closeTime,
            historyLength: desc.historyLength,
          },
        });
      } catch (err) {
        logger.error('Failed to query workflow', { err, loanRequestId: request.params.loanRequestId });
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
      } finally {
        await connection?.close();
      }
    }
  );

  // ── Pending approvals count ───────────────────────────────────
  fastify.get('/api/v1/approvals/pending-count', async (_, reply) => {
    const { rows } = await pool.query(
      "SELECT COUNT(*) as count FROM approval_records WHERE status = 'PENDING'"
    );
    return reply.send({ success: true, data: { count: parseInt(rows[0].count, 10) } });
  });

  const shutdown = async () => {
    await pool.end();
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return fastify;
}

async function main() {
  const server = await buildApiServer();
  const port = parseInt(process.env['API_PORT'] ?? '3001', 10);
  await server.listen({ port, host: '0.0.0.0' });
  logger.info(`Workflow Service API listening on port ${port}`);
}

main().catch((err) => {
  logger.fatal('Failed to start workflow service API', { err });
  process.exit(1);
});
