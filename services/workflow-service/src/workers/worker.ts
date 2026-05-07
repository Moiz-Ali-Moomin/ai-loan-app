import '../instrumentation.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Worker, NativeConnection } from '@temporalio/worker';
import { Client as MinioClient } from 'minio';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaProducerClient, ensureTopicsExist } from '@loan-platform/kafka';
import { createLogger } from '@loan-platform/logger';
import { createLoanActivities } from '../activities/loan.activities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = createLogger('workflow-service:worker');

const TEMPORAL_ADDRESS = process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233';
const TEMPORAL_NAMESPACE = process.env['TEMPORAL_NAMESPACE'] ?? 'loan-governance';
const TEMPORAL_TASK_QUEUE = process.env['TEMPORAL_TASK_QUEUE'] ?? 'loan-approval';

async function ensureNamespace(address: string, namespace: string): Promise<void> {
  try {
    const { Connection, Client } = await import('@temporalio/client');
    const conn = await Connection.connect({ address });
    const client = new Client({ connection: conn, namespace: 'default' });
    try {
      await client.workflowService.registerNamespace({ namespace, workflowExecutionRetentionPeriod: { seconds: BigInt(604800) } });
      logger.info(`Temporal namespace '${namespace}' registered`);
    } catch (err: unknown) {
      // NamespaceAlreadyExists is expected on subsequent starts
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('already exists') && !msg.includes('NamespaceAlreadyExists')) {
        logger.warn('Could not register namespace (non-fatal)', { err: msg });
      }
    } finally {
      await conn.close();
    }
  } catch (err) {
    logger.warn('Temporal namespace pre-registration skipped', { err });
  }
}

async function run() {
  logger.info('Starting Temporal worker...');

  // Ensure namespace exists before worker starts (idempotent)
  await ensureNamespace(TEMPORAL_ADDRESS, TEMPORAL_NAMESPACE);

  const pool = createPool();

  const minioClient = new MinioClient({
    endPoint: process.env['MINIO_ENDPOINT'] ?? 'localhost',
    port: parseInt(process.env['MINIO_PORT'] ?? '9000', 10),
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    accessKey: process.env['MINIO_ACCESS_KEY'] ?? 'minioadmin',
    secretKey: process.env['MINIO_SECRET_KEY'] ?? 'minioadmin',
  });

  const kafka = createKafkaClient('workflow-service');
  await ensureTopicsExist(kafka);
  const kafkaProducer = new KafkaProducerClient(kafka);
  await kafkaProducer.connect();

  const activities = createLoanActivities(pool, minioClient, kafkaProducer, {
    policy: process.env['POLICY_SERVICE_URL'] ?? 'http://localhost:3002',
    ai: process.env['AI_SERVICE_URL'] ?? 'http://localhost:3003',
    audit: process.env['AUDIT_SERVICE_URL'] ?? 'http://localhost:3004',
  });

  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    taskQueue: TEMPORAL_TASK_QUEUE,
    // Use __dirname-compatible path — works with CommonJS (tsconfig module: commonjs)
    workflowsPath: join(__dirname, '..', 'workflows', 'loan-approval.workflow.js'),
    activities,
    maxConcurrentActivityTaskExecutions: 20,
    maxConcurrentWorkflowTaskExecutions: 10,
    reuseV8Context: true,
  });

  const shutdown = async () => {
    logger.info('Shutting down Temporal worker...');
    worker.shutdown();
    await kafkaProducer.disconnect();
    await pool.end();
    await connection.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  logger.info(`Worker listening on task queue: ${TEMPORAL_TASK_QUEUE}`);
  await worker.run();
}

run().catch((err) => {
  logger.fatal('Worker failed to start', { err });
  process.exit(1);
});
