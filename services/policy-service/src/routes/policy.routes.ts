import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { createLogger } from '@loan-platform/logger';
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

      // Store evaluation record — only if a valid loanRequestId was provided
      const pool = fastify.pg;
      if (body.loanRequestId) {
        await pool.query(
          `INSERT INTO policy_evaluations (id, loan_request_id, tenant_id, policy_path, policy_version, decision, allow, violations, flags, input_snapshot, evaluation_metadata, duration_ms)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT DO NOTHING`,
          [
            result.id,
            body.loanRequestId,
            body.tenantId ?? 'system',
            body.policyPath,
            result.policyVersion,
            result.decision,
            result.allow,
            JSON.stringify(result.violations),
            JSON.stringify(result.flags),
            JSON.stringify(body.input),
            JSON.stringify(result.metadata),
            result.durationMs,
          ]
        );
      }

      // Publish policy event
      const producer = fastify.kafkaProducer as KafkaProducerClient;
      await producer.publish(
        KafkaTopic.POLICY_EVENTS,
        'POLICY_EVALUATED',
        {
          evaluationId: result.id,
          loanRequestId: body.input.tenantId,
          tenantId: body.tenantId ?? 'system',
          policyPath: body.policyPath,
          policyVersion: result.policyVersion,
          decision: result.decision,
          violations: result.violations.map(v => v.rule),
          flags: result.flags.map(f => f.rule),
          evaluatedAt: result.evaluatedAt,
        },
        { tenantId: body.tenantId ?? 'system', correlationId, source: 'policy-service' }
      );

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
      const pool = fastify.pg;

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (name) { conditions.push(`name = $${idx++}`); params.push(name); }
      if (active !== undefined) { conditions.push(`is_active = $${idx++}`); params.push(active === 'true'); }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const { rows } = await pool.query(
        `SELECT id, name, version, description, is_active, effective_from, effective_to, checksum, created_at
         FROM policy_versions ${where} ORDER BY created_at DESC`,
        params
      );

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
      const pool = fastify.pg;
      const id = randomUUID();
      const checksum = createHash('sha256').update(body.regoContent).digest('hex');

      const { rows } = await pool.query(
        `INSERT INTO policy_versions (id, name, version, description, content, rego_content, checksum, is_active, effective_from)
         VALUES ($1,$2,$3,$4,$5,$6,$7,false,$8) RETURNING *`,
        [id, body.name, body.version, body.description, body.content, body.regoContent, checksum, body.effectiveFrom]
      );

      logger.info('Policy version created', { id, name: body.name, version: body.version });
      return reply.status(201).send({ success: true, data: rows[0] });
    }
  );

  // Get policy evaluation history
  fastify.get(
    '/policies/evaluations',
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      const limit = request.query.limit ?? 50;
      const pool = fastify.pg;
      const { rows } = await pool.query(
        'SELECT id, policy_path, policy_version, decision, allow, violations, flags, duration_ms, evaluated_at FROM policy_evaluations ORDER BY evaluated_at DESC LIMIT $1',
        [limit]
      );
      return reply.send({ success: true, data: rows });
    }
  );
}
