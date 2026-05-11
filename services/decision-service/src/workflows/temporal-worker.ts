/**
 * Temporal worker bootstrap.
 * Registered as a NestJS lifecycle hook — starts alongside the HTTP server.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, NativeConnection } from '@temporalio/worker';
import { createLogger } from '@loan-platform/logger';
import { DecisionGraphActivities, injectActivityDependencies } from './decision-graph.activities.js';
import type { FlowRepository } from '../repositories/flow.repository.js';
import type { ExecutionRepository } from '../repositories/execution.repository.js';
import type { ApprovalRepository } from '../repositories/approval.repository.js';
import type { AuditClient } from '../audit/audit-client.js';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import type { NodeExecutor } from '../engine/node-executor.js';

const logger = createLogger('decision-service:temporal-worker');

const TASK_QUEUE = 'decision-graph';
const TEMPORAL_NAMESPACE = process.env['TEMPORAL_NAMESPACE'] ?? 'loan-governance';

@Injectable()
export class TemporalWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker | null = null;
  private workerShutdown: (() => Promise<void>) | null = null;

  constructor(
    private readonly flowRepository: FlowRepository,
    private readonly executionRepository: ExecutionRepository,
    private readonly approvalRepository: ApprovalRepository,
    private readonly auditClient: AuditClient,
    private readonly kafkaProducer: KafkaProducerClient,
    private readonly nodeExecutor: NodeExecutor,
  ) {}

  async onModuleInit(): Promise<void> {
    // Inject all NestJS-managed dependencies into the activity module
    injectActivityDependencies({
      flowRepository: this.flowRepository,
      executionRepository: this.executionRepository,
      approvalRepository: this.approvalRepository,
      auditClient: this.auditClient,
      kafkaProducer: this.kafkaProducer,
      nodeExecutor: this.nodeExecutor,
    });

    const temporalAddress = process.env['TEMPORAL_ADDRESS'] ?? 'temporal:7233';

    try {
      const connection = await NativeConnection.connect({ address: temporalAddress });

      this.worker = await Worker.create({
        workflowsPath: require.resolve('./decision-graph.workflow.js'),
        activities: DecisionGraphActivities,
        taskQueue: TASK_QUEUE,
        namespace: TEMPORAL_NAMESPACE,
        connection,
        maxConcurrentActivityTaskExecutions: 20,
        maxConcurrentWorkflowTaskExecutions: 10,
        reuseV8Context: true,
      });

      logger.info('Temporal worker created', { taskQueue: TASK_QUEUE, namespace: TEMPORAL_NAMESPACE });

      // Run worker in background (non-blocking)
      this.workerShutdown = async () => { await this.worker!.shutdown(); };
      this.worker.run().catch(err => {
        logger.error('Temporal worker crashed', { err });
      });
    } catch (err) {
      logger.error('Failed to create Temporal worker', { err });
      // Non-fatal — the HTTP server still starts; re-connect on next restart
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.workerShutdown) {
      logger.info('Shutting down Temporal worker');
      await this.workerShutdown().catch(err => logger.error('Worker shutdown error', { err }));
    }
  }
}
