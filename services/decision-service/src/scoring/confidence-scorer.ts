import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import type {
  ConfidenceBreakdown,
  RiskSignal,
  RiskLevel,
  EscalationReason,
  DecisionOutcome,
  UnderwritingDecisionRequest,
  KYCDecisionRequest,
  AMLDecisionRequest,
} from '../schemas/decision.schema.js';
import type { PolicyEvaluationOutput } from '../policies/policy-evaluator.js';
import type { AIReasoningOutput } from '../reasoning/ai-reasoning-client.js';

const logger = createLogger('decision-service:scoring');

export const CONFIDENCE_ESCALATION_THRESHOLD = 0.75;
export const HIGH_RISK_SCORE_THRESHOLD = 0.7;
export const CRITICAL_RISK_SCORE_THRESHOLD = 0.85;

type DecisionRequest = UnderwritingDecisionRequest | KYCDecisionRequest | AMLDecisionRequest;

export interface ScoringOutput {
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  confidenceBreakdown: ConfidenceBreakdown;
  riskSignals: RiskSignal[];
  escalationReasons: EscalationReason[];
  shouldEscalate: boolean;
  finalDecision: DecisionOutcome;
  reasons: string[];
  recommendedActions: string[];
}

@Injectable()
export class ConfidenceScorer {
  score(
    request: DecisionRequest,
    aiOutput: AIReasoningOutput,
    policyOutput: PolicyEvaluationOutput,
    retrievalQuality: number,
    retrievedCount: number
  ): ScoringOutput {
    const startMs = Date.now();

    const riskSignals = this.aggregateRiskSignals(request, aiOutput, policyOutput);
    const riskScore = this.computeRiskScore(aiOutput, riskSignals, policyOutput);
    const riskLevel = this.classifyRiskLevel(riskScore);
    const dataCompleteness = this.computeDataCompleteness(request);
    const policyConfidence = this.computePolicyConfidence(policyOutput);

    const confidenceBreakdown: ConfidenceBreakdown = {
      ai_confidence: aiOutput.confidence,
      policy_confidence: policyConfidence,
      retrieval_quality: retrievalQuality,
      data_completeness: dataCompleteness,
      composite_score: 0,
    };
    confidenceBreakdown.composite_score = this.computeCompositeConfidence(confidenceBreakdown);

    const { escalationReasons, shouldEscalate } = this.evaluateEscalation(
      confidenceBreakdown.composite_score,
      riskScore,
      policyOutput,
      request,
      retrievedCount,
      aiOutput
    );

    const finalDecision = this.resolveFinalDecision(aiOutput.recommendation, policyOutput, shouldEscalate);
    const reasons = this.buildReasons(riskSignals, policyOutput, aiOutput, escalationReasons);
    const recommendedActions = this.buildRecommendedActions(finalDecision, escalationReasons, riskLevel, request);

    logger.info('Confidence scoring complete', {
      riskScore, riskLevel, confidence: confidenceBreakdown.composite_score, finalDecision, escalationReasons,
      scoringMs: Date.now() - startMs,
    });

    return {
      riskScore,
      riskLevel,
      confidence: confidenceBreakdown.composite_score,
      confidenceBreakdown,
      riskSignals,
      escalationReasons,
      shouldEscalate,
      finalDecision,
      reasons,
      recommendedActions,
    };
  }

  private aggregateRiskSignals(request: DecisionRequest, ai: AIReasoningOutput, policy: PolicyEvaluationOutput): RiskSignal[] {
    const signals: RiskSignal[] = [];
    const risk = request.risk_inputs ?? {};
    const profile = request.customer_profile;
    const financial = request.financial_data;

    for (const factor of ai.riskFactors) {
      signals.push({ signal: factor.factor, value: factor.weight, weight: 0.35, impact: factor.impact, description: factor.description, source: 'ai_reasoning' });
    }

    if (profile.creditScore !== undefined) {
      signals.push({
        signal: 'credit_score', value: profile.creditScore, weight: 0.25,
        impact: profile.creditScore >= 700 ? 'POSITIVE' : profile.creditScore >= 600 ? 'NEUTRAL' : 'NEGATIVE',
        description: `Credit score ${profile.creditScore}`, source: 'credit_bureau',
      });
    }

    if (financial.debtToIncomeRatio !== undefined) {
      signals.push({
        signal: 'debt_to_income_ratio', value: financial.debtToIncomeRatio, weight: 0.2,
        impact: financial.debtToIncomeRatio < 0.36 ? 'POSITIVE' : financial.debtToIncomeRatio < 0.5 ? 'NEUTRAL' : 'NEGATIVE',
        description: `DTI ratio ${(financial.debtToIncomeRatio * 100).toFixed(1)}%`, source: 'financial_data',
      });
    }

    if (risk.fraudScore !== undefined && risk.fraudScore > 0.3) {
      signals.push({ signal: 'fraud_risk', value: risk.fraudScore, weight: 0.3, impact: risk.fraudScore > 0.6 ? 'NEGATIVE' : 'NEUTRAL', description: `Fraud risk score ${risk.fraudScore.toFixed(3)}`, source: 'fraud_engine' });
    }

    if (risk.amlRiskScore !== undefined && risk.amlRiskScore > 0.3) {
      signals.push({ signal: 'aml_risk', value: risk.amlRiskScore, weight: 0.35, impact: 'NEGATIVE', description: `AML risk score ${risk.amlRiskScore.toFixed(3)}`, source: 'aml_engine' });
    }

    if (risk.sanctionsHits !== undefined && risk.sanctionsHits > 0) {
      signals.push({ signal: 'sanctions_hits', value: risk.sanctionsHits, weight: 1.0, impact: 'NEGATIVE', description: `${risk.sanctionsHits} sanctions screening hit(s)`, source: 'sanctions_database' });
    }

    if (!profile.kycVerified) {
      signals.push({ signal: 'kyc_not_verified', value: 1, weight: 0.4, impact: 'NEGATIVE', description: 'KYC verification not completed', source: 'kyc_service' });
    }

    if (!policy.allPassed) {
      signals.push({ signal: 'policy_violations', value: policy.policyFailures.length, weight: 0.5, impact: 'NEGATIVE', description: `${policy.policyFailures.length} policy violation(s)`, source: 'policy_engine' });
    }

    return signals;
  }

  private computeRiskScore(ai: AIReasoningOutput, signals: RiskSignal[], policy: PolicyEvaluationOutput): number {
    const negativeSignals = signals.filter(s => s.impact === 'NEGATIVE');
    const signalScore = negativeSignals.length > 0
      ? negativeSignals.reduce((sum, s) => sum + s.value * s.weight, 0) / negativeSignals.reduce((sum, s) => sum + s.weight, 0)
      : 0;
    const policyScore = policy.hardBlocked ? 1.0 : policy.policyFailures.length / 10;
    return parseFloat(Math.min(ai.riskScore * 0.45 + Math.min(signalScore, 1) * 0.35 + Math.min(policyScore, 1) * 0.20, 1).toFixed(4));
  }

  private classifyRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= CRITICAL_RISK_SCORE_THRESHOLD) return 'CRITICAL';
    if (riskScore >= HIGH_RISK_SCORE_THRESHOLD) return 'HIGH';
    if (riskScore >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private computeDataCompleteness(request: DecisionRequest): number {
    const p = request.customer_profile;
    const f = request.financial_data;
    const checks = [!!p.creditScore, !!p.annualIncome, !!p.employmentStatus, !!p.kycVerified, !!p.dateOfBirth, !!p.nationalId, !!f.requestedAmount, !!f.loanType, !!f.termMonths, f.debtToIncomeRatio !== undefined, (request.documents?.length ?? 0) > 0];
    return parseFloat((checks.filter(Boolean).length / checks.length).toFixed(4));
  }

  private computePolicyConfidence(policy: PolicyEvaluationOutput): number {
    if (policy.hardBlocked) return 0;
    const total = policy.outcomes.length;
    if (total === 0) return 0.5;
    return parseFloat((policy.outcomes.filter((o: { passed: boolean }) => o.passed).length / total).toFixed(4));
  }

  private computeCompositeConfidence(b: ConfidenceBreakdown): number {
    return parseFloat(Math.min(b.ai_confidence * 0.40 + b.policy_confidence * 0.25 + b.retrieval_quality * 0.15 + b.data_completeness * 0.20, 1).toFixed(4));
  }

  private evaluateEscalation(confidence: number, riskScore: number, policy: PolicyEvaluationOutput, request: DecisionRequest, retrievedCount: number, ai: AIReasoningOutput): { escalationReasons: EscalationReason[]; shouldEscalate: boolean } {
    const reasons: EscalationReason[] = [];
    const risk = request.risk_inputs ?? {};
    const profile = request.customer_profile;

    if (confidence < CONFIDENCE_ESCALATION_THRESHOLD) reasons.push('LOW_CONFIDENCE');
    if (policy.hardBlocked && !policy.allPassed && confidence > 0.5) reasons.push('POLICY_CONFLICT');
    if (this.computeDataCompleteness(request) < 0.6) reasons.push('MISSING_DATA');
    if ((risk.amlRiskScore ?? 0) > 0.7) reasons.push('HIGH_AML_RISK');
    if ((risk.sanctionsHits ?? 0) > 0) reasons.push('SANCTIONS_PROXIMITY');
    if ((risk.fraudScore ?? 0) > 0.75) reasons.push('UNUSUAL_PATTERN');
    if (policy.hardBlocked) reasons.push('HARD_POLICY_VIOLATION');
    if (retrievedCount === 0 && riskScore > 0.5) reasons.push('RETRIEVAL_FAILURE');
    if (!profile.kycVerified) reasons.push('MISSING_DATA');
    if (ai.confidence === 0) reasons.push('LOW_CONFIDENCE');

    const unique = [...new Set(reasons)];
    return { escalationReasons: unique, shouldEscalate: unique.length > 0 };
  }

  private resolveFinalDecision(aiRec: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW', policy: PolicyEvaluationOutput, shouldEscalate: boolean): DecisionOutcome {
    if (policy.hardBlocked) return 'REJECT';
    if (shouldEscalate) return 'MANUAL_REVIEW';
    if (!policy.allPassed) return 'MANUAL_REVIEW';
    return aiRec;
  }

  private buildReasons(signals: RiskSignal[], policy: PolicyEvaluationOutput, ai: AIReasoningOutput, escalations: EscalationReason[]): string[] {
    const reasons: string[] = [];
    for (const sig of signals.filter(s => s.impact === 'NEGATIVE').slice(0, 5)) reasons.push(sig.description);
    for (const failure of policy.policyFailures.slice(0, 3)) reasons.push(failure);
    if (escalations.includes('LOW_CONFIDENCE')) reasons.push('Insufficient confidence for automated decision');
    if (escalations.includes('SANCTIONS_PROXIMITY')) reasons.push('Sanctions screening requires human review');
    if (escalations.includes('HIGH_AML_RISK')) reasons.push('Elevated AML risk score');
    if (ai.reasoning && reasons.length < 3) reasons.push(ai.reasoning.slice(0, 200));
    return [...new Set(reasons)].slice(0, 8);
  }

  private buildRecommendedActions(decision: DecisionOutcome, escalations: EscalationReason[], riskLevel: RiskLevel, request: DecisionRequest): string[] {
    const actions: string[] = [];
    const profile = request.customer_profile;
    if (decision === 'MANUAL_REVIEW' || decision === 'ESCALATE') actions.push('Assign to senior underwriter for manual review');
    if (escalations.includes('MISSING_DATA')) actions.push('Request missing customer documentation');
    if (!profile.kycVerified) actions.push('Complete KYC verification before proceeding');
    if (escalations.includes('HIGH_AML_RISK')) actions.push('Initiate enhanced due diligence (EDD) process');
    if (escalations.includes('SANCTIONS_PROXIMITY')) actions.push('Escalate to Compliance Officer for sanctions review');
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') { actions.push('Request additional collateral documentation'); actions.push('Obtain three-month bank statements'); }
    if (escalations.includes('UNUSUAL_PATTERN')) actions.push('Flag transaction for fraud investigation team');
    if (decision === 'APPROVE') { actions.push('Issue conditional approval letter'); actions.push('Complete final document verification'); }
    if (decision === 'REJECT') actions.push('Issue adverse action notice with reason codes');
    return [...new Set(actions)].slice(0, 6);
  }
}
