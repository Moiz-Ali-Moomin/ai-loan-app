import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type {
  UnderwritingDecisionRequest,
  KYCDecisionRequest,
  AMLDecisionRequest,
  ReviewDecisionRequest,
  DecisionResponse,
  DecisionType,
} from '../schemas/decision.schema';
import { RAGRetriever } from '../retrieval/rag-retriever';
import { PolicyEvaluator, type PolicyEvaluationOutput } from '../policies/policy-evaluator';
import { AIReasoningClient } from '../reasoning/ai-reasoning-client';
import { ConfidenceScorer } from '../scoring/confidence-scorer';
import { ExplanationEngine } from '../explainability/explanation-engine';
import { DecisionRepository } from '../repositories/decision.repository';
import { AuditClient } from '../audit/audit-client';
import { DecisionEventPublisher } from '../events/decision-event-publisher';

const logger = createLogger('decision-service:pipeline');

type DecisionRequest =
  | UnderwritingDecisionRequest
  | KYCDecisionRequest
  | AMLDecisionRequest
  | ReviewDecisionRequest;

@Injectable()
export class DecisionPipeline {
  constructor(
    private readonly retriever: RAGRetriever,
    private readonly policyEvaluator: PolicyEvaluator,
    private readonly aiClient: AIReasoningClient,
    private readonly scorer: ConfidenceScorer,
    private readonly explainer: ExplanationEngine,
    private readonly repository: DecisionRepository,
    private readonly auditClient: AuditClient,
    private readonly eventPublisher: DecisionEventPublisher,
  ) {}

  async executeUnderwriting(request: UnderwritingDecisionRequest, traceId: string): Promise<DecisionResponse> {
    return this.execute(request, 'UNDERWRITING', traceId, (req, tid) =>
      this.policyEvaluator.evaluateUnderwriting(req as UnderwritingDecisionRequest, tid)
    );
  }

  async executeKYC(request: KYCDecisionRequest, traceId: string): Promise<DecisionResponse> {
    return this.execute(request, 'KYC', traceId, (req, tid) =>
      this.policyEvaluator.evaluateKYC(req as KYCDecisionRequest, tid)
    );
  }

  async executeAML(request: AMLDecisionRequest, traceId: string): Promise<DecisionResponse> {
    return this.execute(request, 'AML', traceId, (req, tid) =>
      this.policyEvaluator.evaluateAML(req as AMLDecisionRequest, tid)
    );
  }

  async executeReview(request: ReviewDecisionRequest, traceId: string): Promise<DecisionResponse> {
    return this.execute(request, 'REVIEW', traceId, (req, tid) =>
      this.policyEvaluator.evaluateAll(req, tid)
    );
  }

  private async execute(
    request: DecisionRequest,
    decisionType: DecisionType,
    traceId: string,
    evaluatePolicies: (req: DecisionRequest, traceId: string) => Promise<PolicyEvaluationOutput>
  ): Promise<DecisionResponse> {
    const pipelineStart = Date.now();
    const decisionId = randomUUID();
    const correlationId = request.correlation_id ?? randomUUID();

    logger.info('Decision pipeline started', {
      decisionId, decisionType, applicationId: request.application_id, tenantId: request.tenant_id, traceId,
    });

    return withSpan('decision-service', 'pipeline:execute', { decisionId, decisionType, tenantId: request.tenant_id }, async () => {
      // 1. RAG Retrieval
      const retrievalStart = Date.now();
      const ragOutput = await this.retriever.retrieve({
        tenantId: request.tenant_id,
        queryText: this.buildRetrievalQuery(request, decisionType),
        documentTypes: this.getDocumentTypesForDecision(decisionType),
        jurisdiction: request.workflow_context?.jurisdiction,
      });
      const retrievalMs = Date.now() - retrievalStart;

      // 2. OPA Policy Evaluation
      const policyStart = Date.now();
      const policyOutput = await evaluatePolicies(request, traceId);
      const policyMs = Date.now() - policyStart;

      // 3. AI Reasoning — via AI Execution Service only, never direct LLM calls
      const aiStart = Date.now();
      const aiOutput = await this.aiClient.reason(request, ragOutput.contextAddendum, traceId);
      const aiMs = Date.now() - aiStart;

      // 4. Risk Aggregation + Confidence Scoring
      const scoringStart = Date.now();
      const scoringOutput = this.scorer.score(request, aiOutput, policyOutput, ragOutput.qualityScore, ragOutput.results.length);
      const scoringMs = Date.now() - scoringStart;

      // 5. Explainability
      const explanation = this.explainer.generate(
        scoringOutput.finalDecision, scoringOutput.riskSignals, policyOutput.outcomes,
        ragOutput.results, aiOutput, scoringOutput.escalationReasons
      );

      const totalMs = Date.now() - pipelineStart;

      // 6. Persist Decision
      const auditReference = randomUUID();
      await this.repository.save({
        id: decisionId,
        application_id: request.application_id,
        tenant_id: request.tenant_id,
        decision_type: decisionType,
        decision: scoringOutput.finalDecision,
        confidence: scoringOutput.confidence,
        risk_score: scoringOutput.riskScore,
        risk_level: scoringOutput.riskLevel,
        risk_signals: scoringOutput.riskSignals,
        policy_outcomes: policyOutput.outcomes,
        retrieved_context_count: ragOutput.results.length,
        ai_request_id: aiOutput.requestId,
        explanation,
        reasons: scoringOutput.reasons,
        policy_failures: policyOutput.policyFailures,
        recommended_actions: scoringOutput.recommendedActions,
        escalation_reasons: scoringOutput.escalationReasons,
        audit_reference: auditReference,
        workflow_run_id: request.workflow_context?.workflowRunId,
        correlation_id: correlationId,
        processing_latency_ms: totalMs,
      });

      // 7. Emit Audit Event
      await this.auditClient.emit({
        tenantId: request.tenant_id,
        loanRequestId: request.application_id,
        workflowRunId: request.workflow_context?.workflowRunId,
        eventType: `DECISION_${scoringOutput.finalDecision}`,
        actorType: 'SERVICE',
        actorId: 'decision-service',
        serviceName: 'decision-service',
        payload: {
          decisionId, decisionType, decision: scoringOutput.finalDecision,
          riskScore: scoringOutput.riskScore, confidence: scoringOutput.confidence,
          riskLevel: scoringOutput.riskLevel, escalationReasons: scoringOutput.escalationReasons,
          retrievedDocuments: ragOutput.results.map(r => r.document_id),
          aiRequestId: aiOutput.requestId,
          policyOutcomes: policyOutput.outcomes.map(o => ({ path: o.policy_path, passed: o.passed, hardBlock: o.hard_block })),
        },
        metadata: { traceId, correlationId, version: '1.0', environment: process.env['NODE_ENV'] ?? 'production' },
      });

      // 8. Publish Kafka Events
      await this.eventPublisher.publish(scoringOutput.finalDecision, {
        decisionId, applicationId: request.application_id, tenantId: request.tenant_id, decisionType,
        decision: scoringOutput.finalDecision, riskScore: scoringOutput.riskScore,
        riskLevel: scoringOutput.riskLevel, confidence: scoringOutput.confidence,
        escalationReasons: scoringOutput.escalationReasons,
        workflowRunId: request.workflow_context?.workflowRunId,
        correlationId, decidedAt: new Date().toISOString(),
      }, { tenantId: request.tenant_id, correlationId, traceId });

      logger.info('Decision pipeline completed', {
        decisionId, decision: scoringOutput.finalDecision, riskScore: scoringOutput.riskScore,
        confidence: scoringOutput.confidence, totalMs, retrievalMs, policyMs, aiMs, scoringMs,
      });

      // 9. Return Structured Response
      return {
        decision_id: decisionId,
        application_id: request.application_id,
        tenant_id: request.tenant_id,
        decision_type: decisionType,
        decision: scoringOutput.finalDecision,
        confidence: scoringOutput.confidence,
        confidence_breakdown: scoringOutput.confidenceBreakdown,
        risk_level: scoringOutput.riskLevel,
        risk_score: scoringOutput.riskScore,
        risk_signals: scoringOutput.riskSignals,
        reasons: scoringOutput.reasons,
        policy_failures: policyOutput.policyFailures,
        policy_outcomes: policyOutput.outcomes,
        recommended_actions: scoringOutput.recommendedActions,
        escalation_reasons: scoringOutput.escalationReasons.length > 0 ? scoringOutput.escalationReasons : undefined,
        explanation,
        retrieved_context_count: ragOutput.results.length,
        ai_request_id: aiOutput.requestId,
        audit_reference: auditReference,
        workflow_run_id: request.workflow_context?.workflowRunId,
        correlation_id: correlationId,
        decision_timestamp: new Date().toISOString(),
        processing_latency_ms: totalMs,
        pipeline_latency_breakdown: { retrieval_ms: retrievalMs, policy_ms: policyMs, ai_inference_ms: aiMs, scoring_ms: scoringMs, total_ms: totalMs },
      };
    });
  }

  private buildRetrievalQuery(request: DecisionRequest, decisionType: DecisionType): string {
    const financial = request.financial_data;
    const profile = request.customer_profile;
    const risk = request.risk_inputs ?? {};
    return [
      `${decisionType} decision`, `${financial.loanType} loan`, `amount ${financial.requestedAmount}`,
      profile.nationality ? `applicant from ${profile.nationality}` : '',
      risk.sanctionsHits && risk.sanctionsHits > 0 ? 'sanctions screening' : '',
      !profile.kycVerified ? 'KYC verification required' : '',
      risk.amlRiskScore && risk.amlRiskScore > 0.5 ? 'AML monitoring high risk' : '',
      financial.purpose ? `purpose: ${financial.purpose}` : '',
    ].filter(Boolean).join('. ');
  }

  private getDocumentTypesForDecision(decisionType: DecisionType): string[] {
    switch (decisionType) {
      case 'KYC': return ['kyc_guideline', 'compliance_manual', 'aml_policy'];
      case 'AML': return ['aml_policy', 'sanctions_policy', 'compliance_manual'];
      case 'UNDERWRITING': return ['underwriting_sop', 'credit_policy', 'risk_policy', 'compliance_manual'];
      case 'REVIEW': return ['kyc_guideline', 'aml_policy', 'underwriting_sop', 'risk_policy', 'compliance_manual'];
    }
  }
}
