import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import type {
  Explanation,
  RetrievalResult,
  PolicyOutcome,
  RiskSignal,
  DecisionOutcome,
  EscalationReason,
} from '../schemas/decision.schema.js';
import type { AIReasoningOutput } from '../reasoning/ai-reasoning-client.js';

const logger = createLogger('decision-service:explainability');

const REASON_CODE_MAP: Record<string, string> = {
  credit_score: 'RC-01',
  debt_to_income_ratio: 'RC-02',
  kyc_not_verified: 'RC-03',
  fraud_risk: 'RC-04',
  aml_risk: 'RC-05',
  sanctions_hits: 'RC-06',
  policy_violations: 'RC-07',
  missing_documentation: 'RC-08',
  employment_status: 'RC-09',
  insufficient_income: 'RC-10',
  high_existing_debt: 'RC-11',
  ai_service_unavailable: 'RC-99',
};

@Injectable()
export class ExplanationEngine {
  generate(
    decision: DecisionOutcome,
    riskSignals: RiskSignal[],
    policyOutcomes: PolicyOutcome[],
    retrievalResults: RetrievalResult[],
    aiOutput: AIReasoningOutput,
    escalationReasons: EscalationReason[]
  ): Explanation {
    const reasonCodes = this.deriveReasonCodes(riskSignals, policyOutcomes, escalationReasons);
    const supportingEvidence = this.buildSupportingEvidence(riskSignals, policyOutcomes);
    const policyReferences = policyOutcomes.map(o => `${o.policy_path} v${o.policy_version} — ${o.passed ? 'PASSED' : 'FAILED'}`);
    const retrievalReferences = retrievalResults.map(r => `${r.document_type.toUpperCase()}: ${r.title} (similarity: ${r.similarity_score.toFixed(3)})`);

    logger.debug('Explanation generated', { decision, reasonCodeCount: reasonCodes.length });

    return {
      summary: this.buildSummary(decision, riskSignals, escalationReasons, policyOutcomes),
      reason_codes: reasonCodes,
      supporting_evidence: supportingEvidence,
      policy_references: policyReferences,
      retrieval_references: retrievalReferences,
      ai_reasoning_excerpt: aiOutput.reasoning.slice(0, 500),
      decision_logic: this.buildDecisionLogic(decision, aiOutput, policyOutcomes, escalationReasons),
    };
  }

  private deriveReasonCodes(signals: RiskSignal[], policyOutcomes: PolicyOutcome[], escalations: EscalationReason[]): string[] {
    const codes = new Set<string>();
    for (const sig of signals.filter(s => s.impact === 'NEGATIVE')) {
      const code = REASON_CODE_MAP[sig.signal];
      if (code) codes.add(`${code}: ${sig.description}`);
    }
    for (const outcome of policyOutcomes.filter(o => !o.passed)) {
      for (const v of outcome.violations) codes.add(`RC-07: Policy violation — ${v.rule}`);
    }
    if (escalations.includes('LOW_CONFIDENCE')) codes.add('RC-98: Insufficient automated confidence');
    if (escalations.includes('MISSING_DATA')) codes.add('RC-08: Missing required documentation');
    if (escalations.includes('SANCTIONS_PROXIMITY')) codes.add('RC-06: Sanctions screening match');
    if (escalations.includes('HIGH_AML_RISK')) codes.add('RC-05: Elevated AML risk indicator');
    return [...codes].slice(0, 10);
  }

  private buildSupportingEvidence(signals: RiskSignal[], policyOutcomes: PolicyOutcome[]): Explanation['supporting_evidence'] {
    const evidence: Explanation['supporting_evidence'] = [];
    for (const sig of signals.filter(s => s.impact === 'NEGATIVE').slice(0, 4)) {
      evidence.push({ source: sig.source, excerpt: sig.description, relevance: `Risk signal with ${(sig.weight * 100).toFixed(0)}% weight contributing to overall score` });
    }
    for (const outcome of policyOutcomes.filter(o => !o.passed).slice(0, 3)) {
      for (const violation of outcome.violations.slice(0, 2)) {
        evidence.push({ source: `Policy Engine — ${outcome.policy_path}`, excerpt: `${violation.rule}: ${violation.message}`, relevance: `${violation.severity} severity policy violation` });
      }
    }
    return evidence;
  }

  private buildSummary(decision: DecisionOutcome, signals: RiskSignal[], escalations: EscalationReason[], policyOutcomes: PolicyOutcome[]): string {
    const negCount = signals.filter(s => s.impact === 'NEGATIVE').length;
    const failedPolicies = policyOutcomes.filter(o => !o.passed).length;
    switch (decision) {
      case 'APPROVE': return `Application approved. ${signals.filter(s => s.impact === 'POSITIVE').length} positive risk signals identified. All ${policyOutcomes.length} policy evaluations passed.`;
      case 'REJECT': return `Application rejected. ${negCount} adverse risk signal(s). ${failedPolicies} policy violation(s). Review reason codes for regulatory compliance.`;
      case 'MANUAL_REVIEW':
        if (escalations.includes('SANCTIONS_PROXIMITY')) return 'Referred for mandatory compliance review. Sanctions screening requires human verification.';
        if (escalations.includes('LOW_CONFIDENCE')) return `Referred for manual review due to insufficient automated confidence. ${negCount} risk signal(s) require human evaluation.`;
        return `Referred for manual review. ${escalations.length} escalation trigger(s): ${escalations.join(', ')}.`;
      case 'ESCALATE': return `Escalated to senior underwriting team. ${escalations.join(', ')} — requires specialist review.`;
      default: return `Decision: ${decision as string}`;
    }
  }

  private buildDecisionLogic(decision: DecisionOutcome, ai: AIReasoningOutput, policyOutcomes: PolicyOutcome[], escalations: EscalationReason[]): string {
    const parts = [
      `AI recommendation: ${ai.recommendation} (confidence: ${(ai.confidence * 100).toFixed(1)}%)`,
      `Policy evaluation: ${policyOutcomes.filter(o => o.passed).length} passed, ${policyOutcomes.filter(o => !o.passed).length} failed`,
    ];
    if (policyOutcomes.some(o => o.hard_block)) parts.push('Hard policy block detected — AI recommendation overridden');
    if (escalations.length > 0) {
      parts.push(`Escalation triggers: ${escalations.join(', ')}`);
      parts.push('Escalation overrides AI approval — MANUAL_REVIEW enforced');
    }
    parts.push(`Final decision: ${decision}`);
    return parts.join(' | ');
  }
}
