import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Connection, Client } from '@temporalio/client';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { loanSubmissionsTotal } from './health.js';

const logger = createLogger('api-gateway:loans');

const CreateLoanRequestSchema = z.object({
  tenantId: z.string().uuid(),
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
        const loanRequestId = randomUUID();
        const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();
        const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();

        loanSubmissionsTotal.inc({ loan_type: body.loanType, tenant_id: body.tenantId });

        logger.info('Loan application submitted', {
          loanRequestId,
          tenantId: body.tenantId,
          loanType: body.loanType,
          requestedAmount: body.requestedAmount,
          correlationId,
        });

        // Persist to DB
        const pool = fastify.pg;
        await pool.query(
          `INSERT INTO loan_requests (
            id, tenant_id, status, loan_type, requested_amount, requested_term_months,
            purpose, applicant_id, applicant_first_name, applicant_last_name,
            applicant_email, applicant_phone, applicant_date_of_birth, applicant_national_id,
            applicant_employment_status, applicant_annual_income, applicant_credit_score,
            applicant_existing_debt, applicant_kyc_verified, applicant_address,
            business_info, collateral, metadata
          ) VALUES ($1,$2,'PENDING',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
          [
            loanRequestId,
            body.tenantId,
            body.loanType,
            body.requestedAmount,
            body.requestedTermMonths,
            body.purpose,
            randomUUID(), // applicant_id
            body.applicant.firstName,
            body.applicant.lastName,
            body.applicant.email,
            body.applicant.phone,
            body.applicant.dateOfBirth,
            body.applicant.nationalId,
            body.applicant.employmentStatus,
            body.applicant.annualIncome,
            body.applicant.creditScore,
            body.applicant.existingDebt,
            body.applicant.kycVerified,
            JSON.stringify(body.applicant.address),
            body.businessInfo ? JSON.stringify(body.businessInfo) : null,
            body.collateral ? JSON.stringify(body.collateral) : null,
            JSON.stringify({ correlationId, traceId }),
          ]
        );

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

        // Persist workflow run so worker activities can find it by temporal_workflow_id
        await pool.query(
          `INSERT INTO workflow_runs
             (id, tenant_id, loan_request_id, temporal_workflow_id, temporal_run_id,
              status, trace_id, correlation_id)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'RUNNING', $5, $6)`,
          [
            body.tenantId,
            loanRequestId,
            handle.workflowId,
            handle.firstExecutionRunId,
            traceId,
            correlationId,
          ]
        );

        // Publish event
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
          meta: {
            traceId,
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        });
      });
    }
  );

  // Get loan request by ID
  fastify.get(
    '/loans/:id',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const pool = fastify.pg;

      const { rows } = await pool.query(
        `SELECT lr.*, ld.status as decision_status, ld.approved_amount, ld.interest_rate,
                wr.temporal_workflow_id, wr.status as workflow_status, wr.current_step,
                ad.risk_score, ad.risk_level, ad.recommendation as ai_recommendation
         FROM loan_requests lr
         LEFT JOIN loan_decisions ld ON ld.loan_request_id = lr.id
         LEFT JOIN workflow_runs wr ON wr.loan_request_id = lr.id
         LEFT JOIN ai_decisions ad ON ad.loan_request_id = lr.id
         WHERE lr.id = $1`,
        [id]
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

  // List loan requests
  fastify.get(
    '/loans',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number; status?: string; tenantId?: string } }>, reply: FastifyReply) => {
      const { page = 1, limit = 20, status, tenantId } = request.query;
      const offset = (page - 1) * limit;
      const pool = fastify.pg;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let paramIdx = 1;

      if (status) { conditions.push(`lr.status = $${paramIdx++}`); params.push(status); }
      if (tenantId) { conditions.push(`lr.tenant_id = $${paramIdx++}`); params.push(tenantId); }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      params.push(limit, offset);

      const { rows } = await pool.query(
        `SELECT lr.id, lr.tenant_id, lr.status, lr.loan_type, lr.requested_amount,
                lr.applicant_first_name, lr.applicant_last_name, lr.applicant_email,
                lr.submitted_at, wr.status as workflow_status, wr.current_step
         FROM loan_requests lr
         LEFT JOIN workflow_runs wr ON wr.loan_request_id = lr.id
         ${where}
         ORDER BY lr.submitted_at DESC
         LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
        params
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM loan_requests lr ${where}`,
        params.slice(0, -2)
      );

      return reply.send({
        success: true,
        data: rows,
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit,
      });
    }
  );

  // Get workflow state
  fastify.get(
    '/loans/:id/workflow',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const pool = fastify.pg;
      const { rows } = await pool.query(
        'SELECT * FROM workflow_runs WHERE loan_request_id = $1 ORDER BY started_at DESC LIMIT 1',
        [request.params.id]
      );

      if (rows.length === 0) {
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
      }

      return reply.send({ success: true, data: rows[0] });
    }
  );

  // Submit human approval decision
  fastify.post(
    '/loans/:id/approval',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { decision: 'APPROVE' | 'REJECT'; notes: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      const { decision, notes } = request.body;
      const user = request.user;

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
  fastify.get(
    '/loans/:id/audit',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const pool = fastify.pg;
      const { rows } = await pool.query(
        `SELECT id, event_type, actor_type, service_name, payload, trace_id, correlation_id, created_at
         FROM audit_logs WHERE loan_request_id = $1 ORDER BY created_at ASC`,
        [request.params.id]
      );
      return reply.send({ success: true, data: rows });
    }
  );
}
