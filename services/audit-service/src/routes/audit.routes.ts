import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createLogger } from '@loan-platform/logger';
import { AuditRepository } from '../repository/audit.repository.js';

const logger = createLogger('audit-service:routes');

export default async function auditRoutes(fastify: FastifyInstance) {
  const repo = new AuditRepository(fastify.pg);

  // Create audit record
  fastify.post(
    '/audit',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as {
        tenantId: string;
        loanRequestId?: string;
        workflowRunId?: string;
        eventType: string;
        actorId?: string;
        actorType: string;
        serviceName: string;
        payload: Record<string, unknown>;
        metadata: {
          traceId: string;
          spanId?: string;
          correlationId: string;
          version: string;
          environment: string;
        };
      };

      const record = await repo.createRecord(body);

      return reply.status(201).send({ success: true, data: record });
    }
  );

  // Get audit trail for a loan request
  fastify.get(
    '/audit/loans/:loanRequestId',
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const records = await repo.getByLoanRequest(request.params.loanRequestId);
      return reply.send({ success: true, data: records, total: records.length });
    }
  );

  // Get full decision lineage
  fastify.get(
    '/audit/loans/:loanRequestId/lineage',
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const lineage = await repo.getDecisionLineage(request.params.loanRequestId);
      return reply.send({ success: true, data: lineage });
    }
  );

  // Verify audit chain integrity
  fastify.get(
    '/audit/loans/:loanRequestId/integrity',
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const result = await repo.verifyChainIntegrity(request.params.loanRequestId);
      logger.info('Audit integrity check', { loanRequestId: request.params.loanRequestId, ...result });
      return reply.send({ success: true, data: result });
    }
  );

  // Recent audit activity
  fastify.get(
    '/audit/activity',
    async (request: FastifyRequest<{ Querystring: { limit?: number; tenantId?: string } }>, reply: FastifyReply) => {
      const { limit = 100, tenantId } = request.query;
      const conditions = tenantId ? 'WHERE tenant_id = $2' : '';
      const params = tenantId ? [limit, tenantId] : [limit];

      const { rows } = await fastify.pg.query(
        `SELECT id, event_type, actor_type, service_name, loan_request_id, trace_id, created_at
         FROM audit_logs ${conditions} ORDER BY created_at DESC LIMIT $1`,
        params
      );

      return reply.send({ success: true, data: rows });
    }
  );
}
