import './instrumentation.js';
import Fastify from 'fastify';
import Redis from 'ioredis';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaConsumerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';
import { createEventHandlers } from './handlers/index.js';

const logger = createLogger('event-consumer');

async function main() {
  logger.info('Starting Event Consumer Service...');

  const pool = createPool();

  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    retryStrategy: (times) => Math.min(times * 100, 3000),
    maxRetriesPerRequest: 3,
  });

  redis.on('error', (err) => logger.error('Redis error', { err }));
  redis.on('connect', () => logger.info('Redis connected'));

  const kafka = createKafkaClient('event-consumer');
  const consumer = new KafkaConsumerClient(
    kafka,
    process.env['KAFKA_GROUP_ID_EVENTS'] ?? 'event-consumer-group'
  );

  await consumer.connect();
  await consumer.subscribe([
    KafkaTopic.LOAN_REQUESTS,
    KafkaTopic.WORKFLOW_EVENTS,
    KafkaTopic.POLICY_EVENTS,
    KafkaTopic.AI_DECISIONS,
    KafkaTopic.AUDIT_EVENTS,
  ]);

  const handlers = createEventHandlers(pool, redis);

  consumer.registerHandler(KafkaTopic.LOAN_REQUESTS, handlers.handleLoanRequest);
  consumer.registerHandler('LOAN_REQUEST_SUBMITTED', handlers.handleLoanRequest);
  consumer.registerHandler('WORKFLOW_STEP_STARTED', handlers.handleWorkflowEvent);
  consumer.registerHandler('WORKFLOW_STEP_COMPLETED', handlers.handleWorkflowEvent);
  consumer.registerHandler('WORKFLOW_COMPLETED', handlers.handleWorkflowEvent);
  consumer.registerHandler('POLICY_EVALUATED', handlers.handlePolicyEvent);
  consumer.registerHandler('AI_DECISION_MADE', handlers.handleAIDecision);
  consumer.registerHandler('AUDIT_EVENT', handlers.handleAuditEvent);

  await consumer.startConsuming();
  logger.info('Event Consumer listening on all topics');

  // Health endpoint
  const fastify = Fastify({ logger: false });
  fastify.get('/health', async (_, reply) => {
    const redisOk = await redis.ping().then(() => true).catch(() => false);
    return reply.send({ status: redisOk ? 'healthy' : 'degraded', service: 'event-consumer' });
  });
  fastify.get('/metrics', async (_, reply) => reply.type('text/plain').send('# event-consumer metrics\n'));

  const port = parseInt(process.env['PORT'] ?? '3005', 10);
  await fastify.listen({ port, host: '0.0.0.0' });

  const shutdown = async () => {
    logger.info('Shutting down event consumer...');
    await consumer.disconnect();
    await redis.quit();
    await pool.end();
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.fatal('Event consumer failed to start', { err });
  process.exit(1);
});
