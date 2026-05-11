import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { createPool } from '@loan-platform/database';
import { createKafkaClient, KafkaProducerClient, ensureTopicsExist } from '@loan-platform/kafka';
import { DecisionController } from './controllers/decision.controller';
import { HealthController } from './controllers/health.controller';
import { DecisionPipeline } from './services/decision-pipeline';
import { RAGRetriever } from './retrieval/rag-retriever';
import { PolicyEvaluator } from './policies/policy-evaluator';
import { AIReasoningClient } from './reasoning/ai-reasoning-client';
import { ConfidenceScorer } from './scoring/confidence-scorer';
import { ExplanationEngine } from './explainability/explanation-engine';
import { DecisionRepository, DB_POOL_TOKEN } from './repositories/decision.repository';
import { AuditClient } from './audit/audit-client';
import { DecisionEventPublisher } from './events/decision-event-publisher';

const KAFKA_PRODUCER_TOKEN = 'KAFKA_PRODUCER';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
  ],
  controllers: [DecisionController, HealthController],
  providers: [
    // ── Infrastructure providers ──────────────────────────────────────────
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

    // ── Core service providers ────────────────────────────────────────────
    {
      provide: RAGRetriever,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) => new RAGRetriever(pool),
      inject: [DB_POOL_TOKEN],
    },
    PolicyEvaluator,
    AIReasoningClient,
    ConfidenceScorer,
    ExplanationEngine,
    {
      provide: DecisionRepository,
      useFactory: (pool: import('@loan-platform/database').DatabasePool) => new DecisionRepository(pool),
      inject: [DB_POOL_TOKEN],
    },
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
      ) => new DecisionPipeline(retriever, policyEvaluator, aiClient, scorer, explainer, repository, auditClient, eventPublisher),
      inject: [RAGRetriever, PolicyEvaluator, AIReasoningClient, ConfidenceScorer, ExplanationEngine, DecisionRepository, AuditClient, DecisionEventPublisher],
    },
  ],
})
export class DecisionModule {}
