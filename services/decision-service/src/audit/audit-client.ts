import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';

const logger = createLogger('decision-service:audit');

export interface AuditEmitPayload {
  tenantId: string;
  loanRequestId: string;
  workflowRunId?: string;
  eventType: string;
  actorId?: string;
  actorType: string;
  serviceName: string;
  payload: Record<string, unknown>;
  metadata: { traceId: string; correlationId: string; version: string; environment: string; spanId?: string };
}

@Injectable()
export class AuditClient {
  private readonly auditServiceUrl: string;

  constructor() {
    this.auditServiceUrl = process.env['AUDIT_SERVICE_URL'] ?? 'http://localhost:3004';
  }

  async emit(payload: AuditEmitPayload): Promise<void> {
    return withSpan('decision-service', 'audit:emit', { eventType: payload.eventType }, async () => {
      try {
        const resp = await fetch(`${this.auditServiceUrl}/api/v1/audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-trace-id': payload.metadata.traceId,
            'x-correlation-id': payload.metadata.correlationId,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        });

        if (!resp.ok) {
          logger.warn('Audit service returned non-OK', { status: resp.status, eventType: payload.eventType });
          return;
        }
        logger.debug('Audit event emitted', { eventType: payload.eventType, loanRequestId: payload.loanRequestId });
      } catch (err) {
        // Non-fatal — Kafka provides secondary audit trail
        logger.error('Failed to emit audit event', { err, eventType: payload.eventType, loanRequestId: payload.loanRequestId });
      }
    });
  }
}
