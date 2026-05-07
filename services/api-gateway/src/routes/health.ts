import type { FastifyInstance } from 'fastify';
import { collectDefaultMetrics, register, Counter, Histogram } from 'prom-client';

// Initialise Prometheus default metrics (GC, heap, event loop, etc.)
collectDefaultMetrics({ prefix: 'api_gateway_' });

// Custom business metrics
export const httpRequestDuration = new Histogram({
  name: 'api_gateway_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export const loanSubmissionsTotal = new Counter({
  name: 'api_gateway_loan_submissions_total',
  help: 'Total loan applications submitted via API gateway',
  labelNames: ['loan_type', 'tenant_id'],
});

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};

    try {
      await fastify.pg.query('SELECT 1');
      checks['postgres'] = 'ok';
    } catch {
      checks['postgres'] = 'error';
    }

    const healthy = Object.values(checks).every((s) => s === 'ok');

    return reply.status(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: process.env['SERVICE_VERSION'] ?? '1.0.0',
    });
  });

  fastify.get('/ready', async (_, reply) => {
    return reply.send({ ready: true });
  });

  // Prometheus scrape endpoint
  fastify.get('/metrics', async (_, reply) => {
    reply.type(register.contentType);
    return reply.send(await register.metrics());
  });

  // Request duration instrumentation hook
  fastify.addHook('onResponse', async (request, reply) => {
    httpRequestDuration
      .labels(request.method, request.routeOptions?.url ?? request.url, String(reply.statusCode))
      .observe(reply.elapsedTime / 1000);
  });
}
