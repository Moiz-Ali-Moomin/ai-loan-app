import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { Client as MinioClient } from 'minio';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import type { AIDecisionRequest } from '@loan-platform/shared-types';
import { mockLLMAnalyze } from '../llm/mock-llm.js';
import { PromptManager } from '../prompts/prompt-manager.js';

const logger = createLogger('ai-execution:routes');

export default async function aiRoutes(fastify: FastifyInstance) {
  const minioClient = new MinioClient({
    endPoint: process.env['MINIO_ENDPOINT'] ?? 'localhost',
    port: parseInt(process.env['MINIO_PORT'] ?? '9000', 10),
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    accessKey: process.env['MINIO_ACCESS_KEY'] ?? 'minioadmin',
    secretKey: process.env['MINIO_SECRET_KEY'] ?? 'minioadmin',
  });

  const promptManager = new PromptManager(minioClient);

  // AI Risk Analysis endpoint
  fastify.post(
    '/ai/analyze',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as AIDecisionRequest;
      const traceId = (request.headers['x-trace-id'] as string) ?? randomUUID();
      const correlationId = (request.headers['x-correlation-id'] as string) ?? randomUUID();

      return withSpan('ai-execution-service', 'ai:analyze', { loanRequestId: body.loanRequestId, traceId }, async () => {
        const promptVersion = promptManager.getActiveVersion();
        const decisionId = randomUUID();
        const start = Date.now();

        // Build and store prompt
        const prompt = promptManager.buildPrompt(promptVersion, {
          creditScore: body.applicantProfile.creditScore,
          annualIncome: body.applicantProfile.annualIncome,
          existingDebt: body.applicantProfile.existingDebt,
          employmentStatus: body.applicantProfile.employmentStatus,
          age: body.applicantProfile.age,
          kycVerified: body.applicantProfile.kycVerified,
          loanType: body.loanDetails.loanType,
          requestedAmount: body.loanDetails.requestedAmount,
          termMonths: body.loanDetails.termMonths,
          purpose: body.loanDetails.purpose,
          dtiRatio: (body.loanDetails.debtToIncomeRatio * 100).toFixed(2),
          fraudScore: body.fraudScore.toFixed(3),
          policyFlags: body.policyFlags.join(', ') || 'None',
        });

        const promptStorageKey = await promptManager.storePrompt(promptVersion, prompt, body.loanRequestId);

        // Run analysis (mock or real LLM)
        const isMockMode = process.env['AI_MOCK_MODE'] !== 'false';
        const analysis = isMockMode
          ? await mockLLMAnalyze(body, promptVersion)
          : await mockLLMAnalyze(body, promptVersion); // swap with openai call in prod

        const responseStorageKey = await promptManager.storeResponse({ analysis, prompt }, body.loanRequestId);

        const latencyMs = Date.now() - start;

        // Persist to DB
        const pool = fastify.pg;
        const riskLevel = analysis.riskScore > 0.75 ? 'CRITICAL' : analysis.riskScore > 0.55 ? 'HIGH' : analysis.riskScore > 0.35 ? 'MEDIUM' : 'LOW';

        await pool.query(
          `INSERT INTO ai_decisions (id, loan_request_id, tenant_id, risk_score, risk_level, recommendation, confidence, reasoning, risk_factors, suggested_terms, model_version, prompt_version, prompt_storage_key, response_storage_key, tokens_used, latency_ms)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [
            decisionId,
            body.loanRequestId,
            'system', // tenantId injected by workflow via header in production
            analysis.riskScore,
            riskLevel,
            analysis.recommendation,
            analysis.confidence,
            analysis.reasoning,
            JSON.stringify(analysis.riskFactors),
            analysis.suggestedTerms ? JSON.stringify(analysis.suggestedTerms) : null,
            process.env['AI_MODEL'] ?? 'mock-v1',
            promptVersion,
            promptStorageKey,
            responseStorageKey,
            analysis.tokensUsed,
            latencyMs,
          ]
        );

        // Publish AI decision event
        const producer = fastify.kafkaProducer as KafkaProducerClient;
        await producer.publish(
          KafkaTopic.AI_DECISIONS,
          'AI_DECISION_MADE',
          {
            decisionId,
            loanRequestId: body.loanRequestId,
            tenantId: 'system',
            riskScore: analysis.riskScore,
            riskLevel,
            recommendation: analysis.recommendation,
            confidence: analysis.confidence,
            modelVersion: process.env['AI_MODEL'] ?? 'mock-v1',
            decidedAt: new Date().toISOString(),
          },
          { tenantId: 'system', correlationId, source: 'ai-execution-service' }
        );

        logger.info('AI risk analysis completed', {
          loanRequestId: body.loanRequestId,
          decisionId,
          riskScore: analysis.riskScore,
          riskLevel,
          recommendation: analysis.recommendation,
          latencyMs,
          traceId,
        });

        return reply.send({
          success: true,
          data: {
            id: decisionId,
            loanRequestId: body.loanRequestId,
            riskScore: analysis.riskScore,
            riskLevel,
            recommendation: analysis.recommendation,
            confidence: analysis.confidence,
            reasoning: analysis.reasoning,
            riskFactors: analysis.riskFactors,
            suggestedTerms: analysis.suggestedTerms,
            modelVersion: process.env['AI_MODEL'] ?? 'mock-v1',
            promptVersion,
            promptStorageKey,
            responseStorageKey,
            tokensUsed: analysis.tokensUsed,
            latencyMs,
            decidedAt: new Date().toISOString(),
          },
        });
      });
    }
  );

  // Get AI decision by loan request
  fastify.get(
    '/ai/decisions/:loanRequestId',
    async (request: FastifyRequest<{ Params: { loanRequestId: string } }>, reply: FastifyReply) => {
      const pool = fastify.pg;
      const { rows } = await pool.query(
        'SELECT * FROM ai_decisions WHERE loan_request_id = $1 ORDER BY decided_at DESC',
        [request.params.loanRequestId]
      );
      return reply.send({ success: true, data: rows });
    }
  );

  // List recent decisions with metrics
  fastify.get(
    '/ai/decisions',
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      const limit = request.query.limit ?? 50;
      const pool = fastify.pg;
      const { rows } = await pool.query(
        `SELECT id, loan_request_id, risk_score, risk_level, recommendation, confidence, model_version, prompt_version, latency_ms, decided_at
         FROM ai_decisions ORDER BY decided_at DESC LIMIT $1`,
        [limit]
      );
      return reply.send({ success: true, data: rows });
    }
  );
}
