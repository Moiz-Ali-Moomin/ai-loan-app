import './instrumentation.js';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { createLogger } from '@loan-platform/logger';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaProducerClient, ensureTopicsExist } from '@loan-platform/kafka';
import { config } from './config/index.js';
import loanRoutes from './routes/loans.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import proxyRoutes from './routes/proxy.js';

const logger = createLogger('api-gateway');

declare module 'fastify' {
  interface FastifyInstance {
    pg: ReturnType<typeof createPool>;
    kafkaProducer: KafkaProducerClient;
  }
}

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            headers: { 'x-trace-id': request.headers['x-trace-id'] },
            hostname: request.hostname,
            remoteAddress: request.ip,
          };
        },
      },
    },
    genReqId: () => crypto.randomUUID(),
    trustProxy: config.server.trustProxy,
  });

  // Security plugins
  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(fastifyCors, {
    origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:3006'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id', 'X-Correlation-Id'],
  });

  await fastify.register(fastifyRateLimit, {
    global: true,
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    keyGenerator: (req) => (req.user as { sub?: string } | undefined)?.sub ?? req.ip,
    errorResponseBuilder: (_, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${Math.ceil(parseInt(String(context.after), 10) / 1000)}s`,
      },
    }),
  });

  // JWT
  await fastify.register(fastifyJwt, {
    secret: config.jwt.secret,
    sign: { expiresIn: config.jwt.expiry },
  });

  // OpenAPI docs
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'AI Loan Governance Platform API',
        description: 'Production-grade AI governance platform for regulated loan approval',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${config.server.port}`, description: 'Local' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  // Database (Raw Pool)
  const pool = createPool();
  fastify.decorate('pg', pool);

  // Database (Prisma)
  await fastify.register(import('./plugins/prisma.js'));

  // Kafka producer
  const kafka = createKafkaClient('api-gateway');
  await ensureTopicsExist(kafka);
  const producer = new KafkaProducerClient(kafka);
  await producer.connect();
  fastify.decorate('kafkaProducer', producer);

  // Routes
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes, { prefix: '/api/v1' });
  await fastify.register(loanRoutes, { prefix: '/api/v1' });
  await fastify.register(proxyRoutes, { prefix: '/api/v1' });

  // Global error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    logger.error('Request error', {
      err: error,
      method: request.method,
      url: request.url,
      requestId: request.id,
    });

    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: JSON.parse(error.message),
        },
      });
    }

    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code ?? 'INTERNAL_ERROR',
        message: statusCode >= 500 ? 'Internal server error' : error.message,
        traceId: request.id,
      },
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down API gateway...');
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
  await server.listen({ port: config.server.port, host: config.server.host });
  logger.info(`API Gateway listening on ${config.server.host}:${config.server.port}`);
}

main().catch((err) => {
  logger.fatal('Failed to start API Gateway', { err });
  process.exit(1);
});
