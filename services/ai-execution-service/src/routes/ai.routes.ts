import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { Client as MinioClient } from 'minio';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic } from '@loan-platform/shared-types';
import type { AIDecisionRequest } from '@loan-platform/shared-types';
import { mockLLMAnalyze } from '../llm/mock-llm.js';
import { claudeAnalyze } from '../llm/claude-analyzer.js';
import { PromptManager } from '../prompts/prompt-manager.js';
import { RAGPipeline } from '../rag/rag-pipeline.js';

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
  const ragPipeline = new RAGPipeline(fastify.pg);

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

        // ── RAG enrichment ──────────────────────────────────
        // Retrieve relevant compliance/policy context from the vector store
        // and attach it to the system prompt as an authoritative addendum.
        // RAG failure is non-fatal — analysis proceeds with base knowledge.
        const ragEnriched = await ragPipeline.enrichQuery({
          tenantId: body.tenantId,
          queryText: `${body.loanDetails.loanType} loan risk assessment. Amount: ${body.loanDetails.requestedAmount}. Purpose: ${body.loanDetails.purpose}. KYC: ${body.applicantProfile.kycVerified}`,
          documentTypes: ['kyc_guideline', 'aml_policy', 'risk_policy', 'compliance_manual'],
          jurisdiction: (body as unknown as Record<string, unknown>)['jurisdiction'] as string | undefined,
          requesterType: 'service',
          traceId,
          correlationId,
        });

        // Use real Claude when ANTHROPIC_API_KEY is set and AI_MOCK_MODE is not 'true'
        const useMock = process.env['AI_MOCK_MODE'] === 'true' || !process.env['ANTHROPIC_API_KEY'];

        const analysis = useMock
          ? await mockLLMAnalyze(body, promptVersion)
          : await claudeAnalyze(body, prompt, ragEnriched.enrichedSystemAddendum);

        const responseStorageKey = await promptManager.storeResponse(
          { analysis, prompt, model: 'modelVersion' in analysis ? analysis.modelVersion : 'mock-v1' },
          body.loanRequestId
        );

        const latencyMs = Date.now() - start;

        const pool = fastify.pg;
        const riskLevel = analysis.riskScore > 0.75 ? 'CRITICAL'
          : analysis.riskScore > 0.55 ? 'HIGH'
          : analysis.riskScore > 0.35 ? 'MEDIUM'
          : 'LOW';

        const modelVersion = 'modelVersion' in analysis
          ? (analysis as { modelVersion: string }).modelVersion
          : (process.env['AI_MODEL'] ?? 'mock-v1');

        await pool.query(
          `INSERT INTO ai_decisions (
             id, loan_request_id, tenant_id, risk_score, risk_level, recommendation,
             confidence, reasoning, risk_factors, reasoning_factors, suggested_terms,
             model_version, prompt_version, prompt_storage_key, response_storage_key,
             tokens_used, latency_ms
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            decisionId,
            body.loanRequestId,
            body.tenantId,
            analysis.riskScore,
            riskLevel,
            analysis.recommendation,
            analysis.confidence,
            analysis.reasoning,
            JSON.stringify(analysis.riskFactors),
            JSON.stringify(analysis.riskFactors), // reasoning_factors mirrors risk_factors (Claude returns structured)
            analysis.suggestedTerms ? JSON.stringify(analysis.suggestedTerms) : null,
            modelVersion,
            promptVersion,
            promptStorageKey,
            responseStorageKey,
            analysis.tokensUsed,
            latencyMs,
          ]
        );

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
            modelVersion,
            tokensUsed: analysis.tokensUsed,
            latencyMs,
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
          usedMock: useMock,
          modelVersion,
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
            modelVersion,
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

  fastify.get(
    '/ai/decisions',
    async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
      const limit = request.query.limit ?? 50;
      const pool = fastify.pg;
      const { rows } = await pool.query(
        `SELECT id, loan_request_id, risk_score, risk_level, recommendation, confidence,
                model_version, prompt_version, latency_ms, decided_at
         FROM ai_decisions ORDER BY decided_at DESC LIMIT $1`,
        [limit]
      );
      return reply.send({ success: true, data: rows });
    }
  );

  // Confidence metrics endpoint for Prometheus scraping
  fastify.get(
    '/ai/metrics/confidence',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const pool = fastify.pg;
      const { rows } = await pool.query(
        `SELECT
           model_version,
           COUNT(*)::int                               AS total_decisions,
           ROUND(AVG(confidence)::numeric, 4)          AS avg_confidence,
           ROUND(MIN(confidence)::numeric, 4)          AS min_confidence,
           ROUND(MAX(confidence)::numeric, 4)          AS max_confidence,
           ROUND(AVG(risk_score)::numeric, 4)          AS avg_risk_score,
           ROUND(AVG(latency_ms)::numeric, 0)          AS avg_latency_ms,
           SUM(tokens_used)::int                       AS total_tokens_used,
           COUNT(*) FILTER (WHERE recommendation = 'APPROVE')::int   AS approvals,
           COUNT(*) FILTER (WHERE recommendation = 'REJECT')::int    AS rejections,
           COUNT(*) FILTER (WHERE recommendation = 'MANUAL_REVIEW')::int AS manual_reviews
         FROM ai_decisions
         WHERE decided_at > NOW() - INTERVAL '24 hours'
         GROUP BY model_version`
      );
      return reply.send({ success: true, data: rows });
    }
  );
}
