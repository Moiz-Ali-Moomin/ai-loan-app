import { PrismaClient } from './generated/prisma/index.js';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('database:prisma');

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$on('query' as never, (e: any) => {
  if (process.env['LOG_LEVEL'] === 'debug') {
    logger.debug(`Query: ${e.query}`, { params: e.params, duration: e.duration });
  }
});

prisma.$on('error' as never, (e: any) => {
  logger.error(`Prisma Error: ${e.message}`, { target: e.target });
});

export * from './generated/prisma/index.js';
