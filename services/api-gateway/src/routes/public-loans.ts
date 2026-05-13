import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Connection, Client } from '@temporalio/client';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import { encryptPII, getKeyVersion } from '@loan-platform/crypto';
import { config } from '../config/index.js';
import { loanSubmissionsTotal } from './health.js';

const logger = createLogger('api-gateway:public-loans');

const PublicCreateLoanSchema = z.object({
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

export default async function publicLoanRoutes(fastify: FastifyInstance) {
  // Public loan submission — no auth required
  fastify.post(
    '/public/loans',
    async (request: FastifyRequest, reply: FastifyReply) => {
      return withSpan('api-gateway', 'POST /public/loans', { 'http.method': 'POST', 'http.route': '/public/loans' }, async () => {
        const body = PublicCreateLoanSchema.parse(request.body);
        const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();
        const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
        const prisma = fastify.prisma;

        const existing = await prisma.loanRequest.findUnique({
          where: { idempotencyKey: body.idempotencyKey },
          select: { id: true, status: true },
        });
        if (existing) {
          logger.info('Idempotent public loan request — returning existing', {
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

        const keyVersion = getKeyVersion();
        const encFirstName  = encryptPII(body.applicant.firstName);
        const encLastName   = encryptPII(body.applicant.lastName);
        const encPhone      = encryptPII(body.applicant.phone);
        const encNationalId = encryptPII(body.applicant.nationalId);
        const encAddress    = encryptPII(JSON.stringify(body.applicant.address));

        const loanRequestId = randomUUID();

        loanSubmissionsTotal.inc({ loan_type: body.loanType, tenant_id: body.tenantId });

        logger.info('Public loan application submitted', {
          loanRequestId,
          tenantId: body.tenantId,
          loanType: body.loanType,
          requestedAmount: body.requestedAmount,
          correlationId,
        });

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

  // Public status lookup — returns only safe, non-sensitive fields
  fastify.get<{ Params: { id: string } }>(
    '/public/loans/:id',
    async (request, reply) => {
      const { id } = request.params;

      const rows = await fastify.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT lr.id, lr.status, lr.loan_type, lr.requested_amount, lr.requested_term_months,
                lr.purpose, lr.applicant_email, lr.applicant_first_name, lr.applicant_last_name,
                lr.submitted_at, lr.updated_at,
                wr.status as workflow_status, wr.current_step
         FROM loan_requests lr
         LEFT JOIN workflow_runs wr ON wr.loan_request_id = lr.id
         WHERE lr.id = $1::uuid`,
        id,
      );

      if (rows.length === 0) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Loan application not found' },
        });
      }

      return reply.send({ success: true, data: rows[0] });
    }
  );
}
