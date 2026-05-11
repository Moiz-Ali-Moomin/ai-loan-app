import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaProducerClient, ensureTopicsExist } from '@loan-platform/kafka';

// ── Controllers ─────────────────────────────────────────────────────────────────
import { DecisionController } from './controllers/decision.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { FlowsController } from './controllers/flows.controller.js';
import { ExecutionsController } from './controllers/executions.controller.js';
import { ApprovalsController } from './controllers/approvals.controller.js';

// ── Services ────────────────────────────────────────────────────────────────────
import { DecisionPipeline } from './services/decision-pipeline.js';
import { FlowService } from './modules/flows/flow.service.js';
import { ExecutionService } from './modules/execution/execution.service.js';
import { ApprovalService } from './modules/approvals/approval.service.js';

// ── Engine ──────────────────────────────────────────────────────────────────────
import { GraphEngine } from './engine/graph-engine.js';
import { NodeExecutor } from './engine/node-executor.js';

// ── Repositories ────────────────────────────────────────────────────────────────
import { DecisionRepository, DB_POOL_TOKEN } from './repositories/decision.repository.js';
import { FlowRepository } from './repositories/flow.repository.js';
import { ExecutionRepository } from './repositories/execution.repository.js';
import { ApprovalRepository } from './repositories/approval.repository.js';

// ── Infrastructure ──────────────────────────────────────────────────────────────
import { CacheService } from './infrastructure/cache.service.js';

// ── Domain services ─────────────────────────────────────────────────────────────
import { RAGRetriever } from './retrieval/rag-retriever.js';
import { PolicyEvaluator } from './policies/policy-evaluator.js';
import { AIReasoningClient } from './reasoning/ai-reasoning-client.js';
import { ConfidenceScorer } from './scoring/confidence-scorer.js';
import { ExplanationEngine } from './explainability/explanation-engine.js';
import { AuditClient } from './audit/audit-client.js';
import { DecisionEventPublisher } from './events/decision-event-publisher.js';

// ── Auth ────────────────────────────────────────────────────────────────────────
import { JwtAuthGuard, RolesGuard } from './auth/jwt.guard.js';

// ── Temporal ────────────────────────────────────────────────────────────────────
import { TemporalWorkerService } from './workflows/temporal-worker.js';

const KAFKA_PRODUCER_TOKEN = 'KAFKA_PRODUCER';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
  ],
  controllers: [
    DecisionController,
    HealthController,
    FlowsController,
    ExecutionsController,
    ApprovalsController,
  ],
  providers: [
    // ── Global guards ──────────────────────────────────────────────────────────
    // JwtAuthGuard applied per-controller via @UseGuards (not globally),
    // so the existing /health and legacy /api/v1/decisions/* still work.
    Reflector,

    // ── Infrastructure ──────────────────────────────────────────────────────────
    {
      provide: DB_POOL_TOKEN,
      useFactory: () => createPool(),
    },
    {
      provide: KAFKA_PRODUCER_TOKEN,
      useFactory: async () => {
        const kafka = createKafkaClient('decision-service');
        await ensureTopicsExist(kafka);
        const producer = new KafkaProducerClient(kafka);
        await producer.connect();
        return producer;
      },
    },
    CacheService,

    // ── Repositories ────────────────────────────────────────────────────────────
    {
      provide: DecisionRepository,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) =>
        new DecisionRepository(pool),
      inject: [DB_POOL_TOKEN],
    },
    {
      provide: FlowRepository,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) =>
        new FlowRepository(pool),
      inject: [DB_POOL_TOKEN],
    },
    {
      provide: ExecutionRepository,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) =>
        new ExecutionRepository(pool),
      inject: [DB_POOL_TOKEN],
    },
    {
      provide: ApprovalRepository,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) =>
        new ApprovalRepository(pool),
      inject: [DB_POOL_TOKEN],
    },

    // ── Domain pipeline (existing) ──────────────────────────────────────────────
    {
      provide: RAGRetriever,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) => new RAGRetriever(pool),
      inject: [DB_POOL_TOKEN],
    },
    PolicyEvaluator,
    AIReasoningClient,
    ConfidenceScorer,
    ExplanationEngine,
    AuditClient,
    {
      provide: DecisionEventPublisher,
      useFactory: (producer: KafkaProducerClient) => new DecisionEventPublisher(producer),
      inject: [KAFKA_PRODUCER_TOKEN],
    },
    {
      provide: DecisionPipeline,
      useFactory: (
        retriever: RAGRetriever,
        policyEvaluator: PolicyEvaluator,
        aiClient: AIReasoningClient,
        scorer: ConfidenceScorer,
        explainer: ExplanationEngine,
        repository: DecisionRepository,
        auditClient: AuditClient,
        eventPublisher: DecisionEventPublisher,
      ) => new DecisionPipeline(
        retriever, policyEvaluator, aiClient, scorer, explainer,
        repository, auditClient, eventPublisher
      ),
      inject: [
        RAGRetriever, PolicyEvaluator, AIReasoningClient, ConfidenceScorer,
        ExplanationEngine, DecisionRepository, AuditClient, DecisionEventPublisher,
      ],
    },

    // ── Graph engine ────────────────────────────────────────────────────────────
    {
      provide: NodeExecutor,
      useFactory: (policy: PolicyEvaluator, ai: AIReasoningClient, scorer: ConfidenceScorer) =>
        new NodeExecutor(policy, ai, scorer),
      inject: [PolicyEvaluator, AIReasoningClient, ConfidenceScorer],
    },
    {
      provide: GraphEngine,
      useFactory: (nodeExecutor: NodeExecutor) => new GraphEngine(nodeExecutor),
      inject: [NodeExecutor],
    },

    // ── Application services ────────────────────────────────────────────────────
    {
      provide: FlowService,
      useFactory: (
        flowRepository: FlowRepository,
        cache: CacheService,
        producer: KafkaProducerClient,
      ) => new FlowService(flowRepository, cache, producer),
      inject: [FlowRepository, CacheService, KAFKA_PRODUCER_TOKEN],
    },
    {
      provide: ExecutionService,
      useFactory: (
        executionRepository: ExecutionRepository,
        flowRepository: FlowRepository,
        cache: CacheService,
      ) => new ExecutionService(executionRepository, flowRepository, cache),
      inject: [ExecutionRepository, FlowRepository, CacheService],
    },
    {
      provide: ApprovalService,
      useFactory: (
        approvalRepository: ApprovalRepository,
        executionService: ExecutionService,
        cache: CacheService,
        producer: KafkaProducerClient,
      ) => new ApprovalService(approvalRepository, executionService, cache, producer),
      inject: [ApprovalRepository, ExecutionService, CacheService, KAFKA_PRODUCER_TOKEN],
    },

    // ── Temporal worker ─────────────────────────────────────────────────────────
    {
      provide: TemporalWorkerService,
      useFactory: (
        graphEngine: GraphEngine,
        flowRepository: FlowRepository,
        executionRepository: ExecutionRepository,
        approvalRepository: ApprovalRepository,
        auditClient: AuditClient,
        producer: KafkaProducerClient,
        nodeExecutor: NodeExecutor,
      ) => new TemporalWorkerService(
        graphEngine, flowRepository, executionRepository, approvalRepository,
        auditClient, producer, nodeExecutor
      ),
      inject: [
        GraphEngine, FlowRepository, ExecutionRepository, ApprovalRepository,
        AuditClient, KAFKA_PRODUCER_TOKEN, NodeExecutor,
      ],
    },
  ],
})
export class DecisionModule implements OnModuleInit {
  constructor(private readonly cache: CacheService) {}

  async onModuleInit(): Promise<void> {
    await this.cache.connect();
  }
}
