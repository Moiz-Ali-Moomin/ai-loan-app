import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Connection, Client } from '@temporalio/client';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import { encryptPII, getKeyVersion } from '@loan-platform/crypto';
import { requireAuth, type JwtPayload } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { loanSubmissionsTotal } from './health.js';

const logger = createLogger('api-gateway:loans');

const CreateLoanRequestSchema = z.object({
  tenantId: z.string().uuid(),
  idempotencyKey: z.string().uuid('idempotencyKey must be a UUID'),
  applicant: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    dateOfBirth: z.string(),
    nationalId: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
    }),
    employmentStatus: z.enum(['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED']),
    annualIncome: z.number().positive(),
    creditScore: z.number().min(300).max(850),
    existingDebt: z.number().min(0),
    kycVerified: z.boolean(),
  }),
  loanType: z.enum(['PERSONAL', 'BUSINESS', 'MORTGAGE', 'AUTO', 'STUDENT']),
  requestedAmount: z.number().positive(),
  requestedTermMonths: z.number().int().min(1).max(360),
  purpose: z.string().min(10),
  collateral: z.object({
    type: z.string(),
    estimatedValue: z.number().positive(),
    description: z.string(),
  }).optional(),
  businessInfo: z.object({
    name: z.string(),
    registrationNumber: z.string(),
    annualRevenue: z.number().positive(),
    yearsInOperation: z.number().min(0),
    industryCode: z.string(),
  }).optional(),
});

export default async function loanRoutes(fastify: FastifyInstance) {
  // Submit new loan application
  fastify.post(
    '/loans',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return withSpan('api-gateway', 'POST /loans', { 'http.method': 'POST', 'http.route': '/loans' }, async () => {
        const body = CreateLoanRequestSchema.parse(request.body);
        const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();
        const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
        const prisma = fastify.prisma;

        // Idempotency: return cached response if key already used
        const existing = await prisma.loanRequest.findUnique({
          where: { idempotencyKey: body.idempotencyKey },
          select: { id: true, status: true },
        });
        if (existing) {
          logger.info('Idempotent loan request — returning existing', {
            idempotencyKey: body.idempotencyKey,
            loanRequestId: existing.id,
          });
          return reply.status(200).send({
            success: true,
            data: {
              loanRequestId: existing.id,
              workflowId: `loan-${existing.id}`,
              status: existing.status,
              message: 'Loan application already submitted (idempotent)',
            },
            meta: { traceId, requestId: request.id, timestamp: new Date().toISOString() },
          });
        }

        // Encrypt PII fields before persistence
        const keyVersion = getKeyVersion();
        const encFirstName  = encryptPII(body.applicant.firstName);
        const encLastName   = encryptPII(body.applicant.lastName);
        const encPhone      = encryptPII(body.applicant.phone);
        const encNationalId = encryptPII(body.applicant.nationalId);
        const encAddress    = encryptPII(JSON.stringify(body.applicant.address));

        const loanRequestId = randomUUID();

        loanSubmissionsTotal.inc({ loan_type: body.loanType, tenant_id: body.tenantId });

        logger.info('Loan application submitted', {
          loanRequestId,
          tenantId: body.tenantId,
          loanType: body.loanType,
          requestedAmount: body.requestedAmount,
          correlationId,
        });

        // Persist loan request via Prisma
        await prisma.loanRequest.create({
          data: {
            id: loanRequestId,
            tenantId: body.tenantId,
            status: 'PENDING',
            loanType: body.loanType,
            requestedAmount: body.requestedAmount,
            requestedTermMonths: body.requestedTermMonths,
            purpose: body.purpose,
            applicantId: randomUUID(),
            applicantFirstName: encFirstName,
            applicantLastName: encLastName,
            applicantEmail: body.applicant.email,
            applicantPhone: encPhone,
            applicantDateOfBirth: new Date(body.applicant.dateOfBirth),
            applicantNationalId: encNationalId,
            applicantEmploymentStatus: body.applicant.employmentStatus,
            applicantAnnualIncome: body.applicant.annualIncome,
            applicantCreditScore: body.applicant.creditScore,
            applicantExistingDebt: body.applicant.existingDebt,
            applicantKycVerified: body.applicant.kycVerified,
            applicantAddress: body.applicant.address as object,
            applicantAddressEnc: encAddress,
            businessInfo: body.businessInfo ? (body.businessInfo as object) : undefined,
            collateral: body.collateral ? (body.collateral as object) : undefined,
            metadata: { correlationId, traceId },
            idempotencyKey: body.idempotencyKey,
            piiKeyVersion: keyVersion,
          },
        });

        // Start Temporal workflow
        const connection = await Connection.connect({ address: config.temporal.address });
        const client = new Client({ connection, namespace: config.temporal.namespace });

        const handle = await client.workflow.start('loanApprovalWorkflow', {
          taskQueue: config.temporal.taskQueue,
          workflowId: `loan-${loanRequestId}`,
          args: [{
            loanRequestId,
            tenantId: body.tenantId,
            correlationId,
            traceContext: { traceId, spanId: '' },
          }],
        });

        // Persist workflow run via Prisma
        await prisma.workflowRun.create({
          data: {
            tenantId: body.tenantId,
            loanRequestId,
            temporalWorkflowId: handle.workflowId,
            temporalRunId: handle.firstExecutionRunId,
            status: 'RUNNING',
            traceId,
            correlationId,
          },
        });

        const producer = fastify.kafkaProducer as KafkaProducerClient;
        await producer.publish(
          KafkaTopic.LOAN_REQUESTS,
          'LOAN_REQUEST_SUBMITTED',
          {
            loanRequestId,
            tenantId: body.tenantId,
            applicantId: body.applicant.email,
            requestedAmount: body.requestedAmount,
            loanType: body.loanType,
            submittedAt: new Date().toISOString(),
          },
          { tenantId: body.tenantId, correlationId, source: 'api-gateway' }
        );

        await connection.close();

        return reply.status(202).send({
          success: true,
          data: {
            loanRequestId,
            workflowId: handle.workflowId,
            status: 'PENDING',
            message: 'Loan application submitted and workflow started',
          },
          meta: { traceId, requestId: request.id, timestamp: new Date().toISOString() },
        });
      });
    }
  );

  // Get loan request by ID — complex join with downstream tables; $queryRawUnsafe preserves snake_case
  fastify.get<{ Params: { id: string } }>(
    '/loans/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;

      const rows = await fastify.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT lr.*, ld.status as decision_status, ld.approved_amount, ld.interest_rate,
                wr.temporal_workflow_id, wr.status as workflow_status, wr.current_step,
                ad.risk_score, ad.risk_level, ad.recommendation as ai_recommendation
         FROM loan_requests lr
         LEFT JOIN loan_decisions ld ON ld.loan_request_id = lr.id
         LEFT JOIN workflow_runs wr ON wr.loan_request_id = lr.id
         LEFT JOIN ai_decisions ad ON ad.loan_request_id = lr.id
         WHERE lr.id = $1::uuid`,
        id,
      );

      if (rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Loan request not found' },
        });
      }

      return reply.send({ success: true, data: rows[0] });
    }
  );

  // List loan requests — joins workflow_runs for workflow status
  fastify.get<{ Querystring: { page?: number; limit?: number; status?: string; tenantId?: string } }>(
    '/loans',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { page = 1, limit = 20, status, tenantId } = request.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Build parameterized WHERE clause — only hard-coded strings are interpolated
      const conditions: string[] = ['1=1'];
      const filterParams: unknown[] = [];
      let idx = 1;
      if (status)   { conditions.push(`lr.status = $${idx++}`);           filterParams.push(status); }
      if (tenantId) { conditions.push(`lr.tenant_id = $${idx++}::uuid`);  filterParams.push(tenantId); }
      const where = conditions.join(' AND ');

      const rows = await fastify.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT lr.id, lr.tenant_id, lr.status, lr.loan_type, lr.requested_amount,
                lr.applicant_email, lr.applicant_first_name, lr.applicant_last_name,
                lr.applicant_credit_score, lr.submitted_at,
                wr.status as workflow_status, wr.current_step
         FROM loan_requests lr
         LEFT JOIN workflow_runs wr ON wr.loan_request_id = lr.id
         WHERE ${where}
         ORDER BY lr.submitted_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        ...filterParams, Number(limit), offset,
      );

      const countResult = await fastify.prisma.$queryRawUnsafe<Array<{ count: string }>>(
        `SELECT COUNT(*) as count FROM loan_requests lr WHERE ${where}`,
        ...filterParams,
      );

      return reply.send({
        success: true,
        data: rows,
        total: parseInt(countResult[0]?.count ?? '0', 10),
        page: Number(page),
        limit: Number(limit),
      });
    }
  );

  // Get workflow state
  fastify.get<{ Params: { id: string } }>(
    '/loans/:id/workflow',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const rows = await fastify.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM workflow_runs
         WHERE loan_request_id = $1::uuid
         ORDER BY started_at DESC LIMIT 1`,
        request.params.id,
      );

      if (rows.length === 0) {
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
      }

      return reply.send({ success: true, data: rows[0] });
    }
  );

  // Submit human approval decision
  fastify.post<{ Params: { id: string }; Body: { decision: 'APPROVE' | 'REJECT'; notes: string } }>(
    '/loans/:id/approval',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;
      const { decision, notes } = request.body;
      const user = request.user as JwtPayload | undefined;

      const connection = await Connection.connect({ address: config.temporal.address });
      const client = new Client({ connection, namespace: config.temporal.namespace });

      const handle = client.workflow.getHandle(`loan-${id}`);
      await handle.signal('humanApprovalSignal', {
        decision,
        reviewerId: user?.sub,
        reviewerNotes: notes,
        decidedAt: new Date().toISOString(),
      });

      await connection.close();

      logger.info('Human approval signal sent', { loanRequestId: id, decision, reviewerId: user?.sub });

      return reply.send({
        success: true,
        data: { loanRequestId: id, decision, message: 'Approval decision recorded' },
      });
    }
  );

  // Get audit trail
  fastify.get<{ Params: { id: string } }>(
    '/loans/:id/audit',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const rows = await fastify.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT id, event_type, actor_type, service_name, payload, trace_id, correlation_id, created_at
         FROM audit_logs
         WHERE loan_request_id = $1::uuid
         ORDER BY created_at ASC`,
        request.params.id,
      );
      return reply.send({ success: true, data: rows });
    }
  );

  // Generate FCRA adverse action notice for denied loans
  fastify.get<{ Params: { id: string } }>(
    '/loans/:id/adverse-action-notice',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params;

      const decisionRows = await fastify.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT ld.status, ld.rejection_reason, ld.decided_at,
                ad.reasoning_factors, ad.risk_factors,
                pe.violations, pe.flags,
                lr.applicant_email, lr.loan_type, lr.requested_amount
         FROM loan_decisions ld
         JOIN loan_requests lr ON lr.id = ld.loan_request_id
         LEFT JOIN ai_decisions ad ON ad.loan_request_id = ld.loan_request_id
         LEFT JOIN policy_evaluations pe ON pe.loan_request_id = ld.loan_request_id
         WHERE ld.loan_request_id = $1::uuid
         ORDER BY ld.decided_at DESC LIMIT 1`,
        id,
      );

      if (decisionRows.length === 0) {
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Decision not found' } });
      }

      const decision = decisionRows[0];

      if (decision['status'] !== 'REJECTED') {
        return reply.status(400).send({
          success: false,
          error: { code: 'NOT_APPLICABLE', message: 'Adverse action notice only applies to rejected applications' },
        });
      }

      const reasoningFactors = (decision['reasoning_factors'] ?? decision['risk_factors'] ?? []) as Array<Record<string, unknown>>;
      const violations = (decision['violations'] ?? []) as Array<Record<string, unknown>>;

      const reasons: string[] = [];

      const negativeFactors = reasoningFactors
        .filter((f) => f['impact'] === 'NEGATIVE')
        .sort((a, b) => Number(b['weight'] ?? 0) - Number(a['weight'] ?? 0))
        .slice(0, 4);

      for (const factor of negativeFactors) {
        reasons.push(String(factor['description'] ?? factor['factor']));
      }

      for (const v of violations) {
        if (v['severity'] === 'HARD' && reasons.length < 4) {
          reasons.push(String(v['message'] ?? v['rule']));
        }
      }

      const decidedAt = new Date(String(decision['decided_at']));
      const deadlineAt = new Date(decidedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      await fastify.prisma.$executeRawUnsafe(
        `INSERT INTO adverse_action_notices
           (loan_request_id, tenant_id, deadline_at, delivery_method, reasons)
         SELECT $1::uuid, lr.tenant_id, $2::timestamptz, 'DOWNLOAD', $3::jsonb
         FROM loan_requests lr WHERE lr.id = $1::uuid
         ON CONFLICT DO NOTHING`,
        id, deadlineAt.toISOString(), JSON.stringify(reasons),
      );

      return reply.send({
        success: true,
        data: {
          loanRequestId: id,
          applicantEmail: decision['applicant_email'],
          loanType: decision['loan_type'],
          requestedAmount: decision['requested_amount'],
          decisionDate: decision['decided_at'],
          deadlineDate: deadlineAt.toISOString(),
          principalReasons: reasons,
          regulatoryBasis: 'Fair Credit Reporting Act (FCRA) Section 615(a)',
          notice: [
            'ADVERSE ACTION NOTICE',
            '',
            `We regret to inform you that your ${String(decision['loan_type'])} loan application`,
            `for $${Number(decision['requested_amount']).toLocaleString()} has been declined.`,
            '',
            'Principal reasons for this decision:',
            ...reasons.map((r, i) => `  ${i + 1}. ${r}`),
            '',
            'You have the right to obtain a free copy of your credit report within 60 days.',
            'You have the right to dispute the accuracy of information in your credit report.',
            '',
            `Decision date: ${decidedAt.toDateString()}`,
            `Notice deadline: ${deadlineAt.toDateString()}`,
            '',
            'This notice is provided in accordance with the Fair Credit Reporting Act.',
          ].join('\n'),
        },
      });
    }
  );
}
