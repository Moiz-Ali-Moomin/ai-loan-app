#!/usr/bin/env node
/**
 * Seed compliance documents into the vector store.
 *
 * Usage:
 *   TENANT_ID=<uuid> node dist/rag/datasets/seed-compliance-docs.js
 *
 * The TENANT_ID environment variable must be set to a valid tenant UUID
 * in the database. Defaults to the first tenant in the tenants table if
 * not specified.
 *
 * Environment variables required:
 *   DATABASE_URL
 *   EMBEDDING_PROVIDER (default: openai)
 *   EMBEDDING_MODEL    (default: text-embedding-3-small)
 *   OPENAI_API_KEY     (required when EMBEDDING_PROVIDER=openai)
 */

import { createPool } from '@loan-platform/database';
import { createLogger } from '@loan-platform/logger';
import { IngestionService } from '../ingestion/ingestion-service.js';
import { COMPLIANCE_DOCUMENTS } from './fintech-compliance-docs.js';

const logger = createLogger('compliance-seed');

async function resolveDefaultTenantId(pool: ReturnType<typeof createPool>): Promise<string> {
  const { rows } = await pool.query(
    "SELECT id FROM tenants WHERE is_active = true ORDER BY created_at ASC LIMIT 1",
  );
  if (rows.length === 0) throw new Error('No active tenants found in database');
  return (rows[0] as Record<string, unknown>)['id'] as string;
}

async function main() {
  const pool = createPool();
  const tenantId = process.env['TENANT_ID'] ?? await resolveDefaultTenantId(pool);

  logger.info('Starting compliance document seeding', {
    tenantId,
    documentCount: COMPLIANCE_DOCUMENTS.length,
    embeddingProvider: process.env['EMBEDDING_PROVIDER'] ?? 'openai',
    embeddingModel: process.env['EMBEDDING_MODEL'] ?? 'text-embedding-3-small',
  });

  const service = new IngestionService(pool);
  let succeeded = 0;
  let failed = 0;

  for (const doc of COMPLIANCE_DOCUMENTS) {
    try {
      logger.info(`Ingesting: ${doc.title}`, { source: doc.source, documentType: doc.documentType });
      const result = await service.ingestDocument({ ...doc, tenantId });
      logger.info(`Ingested: ${doc.title}`, {
        jobId: result.jobId,
        totalChunks: result.totalChunks,
        processedChunks: result.processedChunks,
        status: result.status,
        durationMs: result.durationMs,
      });
      succeeded++;
    } catch (err) {
      logger.error(`Failed to ingest: ${doc.title}`, { source: doc.source, err });
      failed++;
    }
  }

  await pool.end();

  logger.info('Seeding complete', {
    total: COMPLIANCE_DOCUMENTS.length,
    succeeded,
    failed,
  });

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
