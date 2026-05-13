import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import { prisma } from '@loan-platform/database';
import { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import { evaluateOpaPolicy } from '../opa/client.js';

const logger = createLogger('policy-service:routes');

const EvaluateSchema = z.object({
  policyPath: z.string().min(1),
  loanRequestId: z.string().uuid().optional(),
  input: z.object({
    loan: z.object({
      requestedAmount: z.number(),
      loanType: z.string(),
      termMonths: z.number(),
      purpose: z.string(),
    }),
    applicant: z.object({
      creditScore: z.number(),
      annualIncome: z.number(),
      existingDebt: z.number(),
      kycVerified: z.boolean(),
      employmentStatus: z.string(),
      age: z.number(),
    }),
    riskScore: z.number().optional(),
    fraudScore: z.number().optional(),
    tenantId: z.string().optional(),
  }),
  tenantId: z.string().optional(),
  traceId: z.string().optional(),
});

export default async function policyRoutes(fastify: FastifyInstance) {
  // Evaluate policy
  fastify.post(
    '/policies/evaluate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = EvaluateSchema.parse(request.body);
      const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
      const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();

      const result = await evaluateOpaPolicy(body.policyPath, body.input, traceId);

      if (body.loanRequestId) {
        await prisma.policyEvaluation.create({
          data: {
            id: result.id,
            loanRequestId: body.loanRequestId,
            tenantId: body.tenantId ?? 'system',
            policyPath: body.policyPath,
            policyVersion: result.policyVersion,
            decision: result.decision,
            allow: result.allow,
            violations: result.violations as object[],
            flags: result.flags as object[],
            inputSnapshot: body.input as object,
            evaluationMetadata: result.metadata as object,
            durationMs: result.durationMs,
          },
        }).catch(() => {
          // ON CONFLICT DO NOTHING equivalent — idempotent
        });
      }

      const producer = fastify.kafkaProducer as KafkaProducerClient;
      producer.publish(
        KafkaTopic.POLICY_EVENTS,
        'POLICY_EVALUATED',
        {
          evaluationId: result.id,
          loanRequestId: body.loanRequestId ?? '',
          tenantId: body.tenantId ?? 'system',
          policyPath: body.policyPath,
          policyVersion: result.policyVersion,
          decision: result.decision,
          violations: result.violations.map(v => v.rule),
          flags: result.flags.map(f => f.rule),
          evaluatedAt: result.evaluatedAt,
        },
        { tenantId: body.tenantId ?? 'system', correlationId, source: 'policy-service' }
      ).catch(err => logger.error('Failed to publish policy event to Kafka', { evaluationId: result.id, err }));

      logger.info('Policy evaluated', {
        evaluationId: result.id,
        decision: result.decision,
        policyPath: body.policyPath,
        violationCount: result.violations.length,
        traceId,
      });

      return reply.send({ success: true, data: result });
    }
  );

  // List policy versions
  fastify.get(
    '/policies/versions',
    async (request: FastifyRequest<{ Querystring: { name?: string; active?: string } }>, reply: FastifyReply) => {
      const { name, active } = request.query;

      const rows = await prisma.policyVersion.findMany({
        where: {
          ...(name ? { name } : {}),
          ...(active !== undefined ? { isActive: active === 'true' } : {}),
        },
        select: {
          id: true, name: true, version: true, description: true,
          isActive: true, effectiveFrom: true, effectiveTo: true,
          checksum: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({ success: true, data: rows });
    }
  );

  // Create policy version
  fastify.post(
    '/policies/versions',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as {
        name: string; version: string; description: string;
        content: string; regoContent: string; effectiveFrom: string;
      };
      const id = randomUUID();
      const checksum = createHash('sha256').update(body.regoContent).digest('hex');

      const row = await prisma.policyVersion.create({
        data: {
          id,
          name: body.name,
          version: body.version,
          description: body.description,
          content: body.content,
          regoContent: body.regoContent,
          checksum,
          isActive: false,
          effectiveFrom: new Date(body.effectiveFrom),
        },
      });

      logger.info('Policy version created', { id, name: body.name, version: body.version });
      return reply.status(201).send({ success: true, data: row });
    }
  );

  // Get policy evaluation history
  fastify.get(
    '/policies/evaluations',
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      const limit = Number(request.query.limit ?? 50);

      const rows = await prisma.policyEvaluation.findMany({
        select: {
          id: true, policyPath: true, policyVersion: true, decision: true,
          allow: true, violations: true, flags: true, durationMs: true, evaluatedAt: true,
        },
        orderBy: { evaluatedAt: 'desc' },
        take: limit,
      });

      return reply.send({ success: true, data: rows });
    }
  );
}
