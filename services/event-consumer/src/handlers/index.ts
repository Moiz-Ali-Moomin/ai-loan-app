import axios from 'axios';
import type { Redis } from 'ioredis';
import type { Pool } from 'pg';
import type {
  KafkaEventEnvelope, LoanRequestEvent, WorkflowEvent,
  PolicyEvent, AIDecisionEvent, AuditEvent,
} from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';
import { LoanPlatformMetrics } from '@loan-platform/telemetry';

const logger = createLogger('event-consumer:handlers');

const AUDIT_SERVICE_URL = process.env['AUDIT_SERVICE_URL'] ?? 'http://localhost:3004';

export function createEventHandlers(_pool: Pool, redis: Redis) {
  const loanRequestsCounter = LoanPlatformMetrics.loanRequestsTotal();
  const aiDecisionsCounter = LoanPlatformMetrics.aiDecisionsTotal();
  const policyViolationsCounter = LoanPlatformMetrics.policyViolationsTotal();
  const auditRecordsCounter = LoanPlatformMetrics.auditRecordsCreated();
  const kafkaConsumedCounter = LoanPlatformMetrics.kafkaMessagesConsumed();

  return {
    async handleLoanRequest(envelope: KafkaEventEnvelope<LoanRequestEvent>): Promise<void> {
      const { payload } = envelope;
      kafkaConsumedCounter.add(1, { topic: 'loan.requests', eventType: envelope.eventType });

      if (envelope.eventType === 'LOAN_REQUEST_SUBMITTED') {
        loanRequestsCounter.add(1, {
          tenant_id: payload.tenantId,
          loan_type: payload.loanType,
          status: 'submitted',
        });

        // Cache latest status in Redis
        await redis.setex(
          `loan:${payload.loanRequestId}:status`,
          3600,
          JSON.stringify({ status: 'PENDING', submittedAt: payload.submittedAt })
        );

        logger.info('Loan request event processed', {
          loanRequestId: payload.loanRequestId,
          tenantId: payload.tenantId,
          correlationId: envelope.correlationId,
        });
      }
    },

    async handleWorkflowEvent(envelope: KafkaEventEnvelope<WorkflowEvent>): Promise<void> {
      const { payload } = envelope;
      kafkaConsumedCounter.add(1, { topic: 'workflow.events', eventType: envelope.eventType });

      // Update Redis cache for real-time UI
      await redis.setex(
        `workflow:${payload.workflowRunId}:state`,
        7200,
        JSON.stringify({
          status: payload.status,
          step: payload.step,
          updatedAt: payload.timestamp,
        })
      );

      if (payload.eventType === 'WORKFLOW_COMPLETED') {
        await redis.setex(
          `loan:${payload.loanRequestId}:status`,
          86400,
          JSON.stringify({ status: payload.status, completedAt: payload.timestamp })
        );
      }

      logger.debug('Workflow event processed', {
        workflowRunId: payload.workflowRunId,
        eventType: payload.eventType,
        step: payload.step,
      });
    },

    async handlePolicyEvent(envelope: KafkaEventEnvelope<PolicyEvent>): Promise<void> {
      const { payload } = envelope;
      kafkaConsumedCounter.add(1, { topic: 'policy.events', eventType: envelope.eventType });

      if (payload.violations.length > 0) {
        policyViolationsCounter.add(payload.violations.length, {
          tenant_id: payload.tenantId,
          policy_path: payload.policyPath,
          decision: payload.decision,
        });
      }

      // Persist to audit via audit service
      try {
        await axios.post(`${AUDIT_SERVICE_URL}/api/v1/audit`, {
          tenantId: payload.tenantId,
          loanRequestId: payload.loanRequestId,
          eventType: 'POLICY_EVALUATED',
          actorType: 'POLICY_ENGINE',
          serviceName: 'event-consumer',
          payload: {
            evaluationId: payload.evaluationId,
            policyPath: payload.policyPath,
            decision: payload.decision,
            violations: payload.violations,
            flags: payload.flags,
          },
          metadata: {
            traceId: envelope.traceId,
            correlationId: envelope.correlationId,
            version: envelope.version,
            environment: process.env['NODE_ENV'] ?? 'development',
          },
        });
        auditRecordsCounter.add(1, { event_type: 'POLICY_EVALUATED' });
      } catch (err) {
        logger.error('Failed to persist policy audit record', { err, evaluationId: payload.evaluationId });
      }
    },

    async handleAIDecision(envelope: KafkaEventEnvelope<AIDecisionEvent>): Promise<void> {
      const { payload } = envelope;
      kafkaConsumedCounter.add(1, { topic: 'ai.decisions', eventType: envelope.eventType });

      aiDecisionsCounter.add(1, {
        risk_level: payload.riskLevel,
        recommendation: payload.recommendation,
        model_version: payload.modelVersion,
      });

      // Aggregate risk score metrics in Redis sorted set
      await redis.zadd(`tenant:${payload.tenantId}:risk_scores`, payload.riskScore, payload.decisionId);
      await redis.expire(`tenant:${payload.tenantId}:risk_scores`, 86400);

      logger.info('AI decision event processed', {
        decisionId: payload.decisionId,
        riskLevel: payload.riskLevel,
        recommendation: payload.recommendation,
      });
    },

    async handleAuditEvent(envelope: KafkaEventEnvelope<AuditEvent>): Promise<void> {
      kafkaConsumedCounter.add(1, { topic: 'audit.events', eventType: envelope.eventType });
      auditRecordsCounter.add(1, { event_type: envelope.payload.eventType as string });

      logger.debug('Audit event consumed', {
        auditId: envelope.payload.auditId as string,
        eventType: envelope.payload.eventType as string,
      });
    },
  };
}
