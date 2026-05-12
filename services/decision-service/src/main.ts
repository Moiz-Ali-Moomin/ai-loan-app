import './instrumentation';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { createLogger } from '@loan-platform/logger';
import { DecisionModule } from './decision.module.js';

const logger = createLogger('decision-service');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    DecisionModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
      genReqId: () => crypto.randomUUID(),
    }),
    { logger: false }
  );

  const port = parseInt(process.env['PORT'] ?? '3007', 10);
  await app.listen(port, '0.0.0.0');

  logger.info(`Decision Service (NestJS) listening on port ${port}`);

  const shutdown = async () => {
    logger.info('Shutting down decision-service');
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  logger.fatal('Failed to start decision-service', { err });
  process.exit(1);
});
