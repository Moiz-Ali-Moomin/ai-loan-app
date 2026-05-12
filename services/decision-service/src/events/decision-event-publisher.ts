import { Injectable } from '@nestjs/common';
import { KafkaTopic } from '@loan-platform/shared-types';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import { createLogger } from '@loan-platform/logger';
import type { DecisionOutcome } from '../schemas/decision.schema.js';

const logger = createLogger('decision-service:events');

export interface DecisionEventPayload {
  decisionId: string;
  applicationId: string;
  tenantId: string;
  decisionType: string;
  decision: DecisionOutcome;
  riskScore: number;
  riskLevel: string;
  confidence: number;
  escalationReasons: string[];
  workflowRunId?: string;
  correlationId: string;
  decidedAt: string;
}

const DECISION_EVENT_TYPE_MAP: Record<DecisionOutcome, string> = {
  APPROVE: 'decision.approved',
  REJECT: 'decision.rejected',
  MANUAL_REVIEW: 'decision.escalated',
  ESCALATE: 'decision.escalated',
};

@Injectable()
export class DecisionEventPublisher {
  constructor(private readonly producer: KafkaProducerClient) {}

  async publish(
    outcome: DecisionOutcome,
    payload: DecisionEventPayload,
    options: { tenantId: string; correlationId: string; traceId: string }
  ): Promise<void> {
    const eventType = DECISION_EVENT_TYPE_MAP[outcome];

    try {
      await this.producer.publish(KafkaTopic.AI_DECISIONS, eventType, payload, {
        tenantId: options.tenantId,
        correlationId: options.correlationId,
        source: 'decision-service',
        key: payload.applicationId,
      });

      await this.producer.publish(KafkaTopic.WORKFLOW_EVENTS, 'DECISION_COMPLETED', {
        workflowRunId: payload.workflowRunId,
        applicationId: payload.applicationId,
        decisionId: payload.decisionId,
        decision: payload.decision,
        riskLevel: payload.riskLevel,
        confidence: payload.confidence,
        requiresHumanReview: payload.decision === 'MANUAL_REVIEW' || payload.decision === 'ESCALATE',
        decidedAt: payload.decidedAt,
      }, {
        tenantId: options.tenantId,
        correlationId: options.correlationId,
        source: 'decision-service',
        key: payload.workflowRunId ?? payload.applicationId,
      });

      logger.info('Decision events published', { eventType, applicationId: payload.applicationId, decision: payload.decision });
    } catch (err) {
      logger.error('Failed to publish decision events', { err, applicationId: payload.applicationId, eventType });
      throw err;
    }
  }
}
