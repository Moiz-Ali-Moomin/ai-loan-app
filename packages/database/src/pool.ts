import { Pool } from 'pg';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('database');

export type DatabasePool = Pool;

let pool: Pool | null = null;

export function createPool(connectionString?: string): Pool {
  const dbUrl = connectionString ?? process.env['DATABASE_URL'];

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const newPool = new Pool({
    connectionString: dbUrl,
    max: parseInt(process.env['DB_POOL_MAX'] ?? '20', 10),
    min: parseInt(process.env['DB_POOL_MIN'] ?? '2', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
  });

  newPool.on('error', (err) => {
    logger.error('Unexpected database pool error', { err });
  });

  newPool.on('connect', () => {
    logger.debug('New database connection established');
  });

  pool = newPool;
  return newPool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createPool() first.');
  }
  return pool;
}
