import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { initTelemetry, getTelemetryConfig } from '@loan-platform/telemetry';
import { config } from '../config/index.js';

export default fp(async function telemetryPlugin(fastify: FastifyInstance) {
  const telemetryConfig = getTelemetryConfig(config.otel.serviceName);
  initTelemetry(telemetryConfig);

  fastify.addHook('onRequest', async (request) => {
    request.log.info({
      method: request.method,
      url: request.url,
      requestId: request.id,
    }, 'Incoming request');
  });
});
