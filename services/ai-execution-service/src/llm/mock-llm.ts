import type { AIDecisionRequest, AIDecisionResult, RiskFactor, RiskLevel, SuggestedLoanTerms } from '@loan-platform/shared-types';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('ai-execution:mock-llm');

/**
 * Deterministic mock LLM that simulates production AI risk scoring.
 * Returns reproducible results for the same input (idempotent).
 * In production, swap this with real OpenAI/Anthropic calls.
 */
export async function mockLLMAnalyze(
  request: AIDecisionRequest,
  promptVersion: string
): Promise<{ reasoning: string; riskScore: number; recommendation: string; confidence: number; riskFactors: RiskFactor[]; suggestedTerms?: SuggestedLoanTerms; tokensUsed: number }> {
  const start = Date.now();

  // Simulate LLM latency
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));

  const { applicantProfile, loanDetails, fraudScore, policyFlags } = request;

  const riskFactors: RiskFactor[] = [];
  let riskScore = 0.1;

  // Credit score factor
  if (applicantProfile.creditScore >= 750) {
    riskFactors.push({ factor: 'credit_score', impact: 'POSITIVE', weight: 0.30, description: `Excellent credit score (${applicantProfile.creditScore})` });
    riskScore -= 0.05;
  } else if (applicantProfile.creditScore >= 680) {
    riskFactors.push({ factor: 'credit_score', impact: 'POSITIVE', weight: 0.15, description: `Good credit score (${applicantProfile.creditScore})` });
  } else if (applicantProfile.creditScore >= 580) {
    riskFactors.push({ factor: 'credit_score', impact: 'NEGATIVE', weight: 0.20, description: `Fair credit score (${applicantProfile.creditScore})` });
    riskScore += 0.15;
  } else {
    riskFactors.push({ factor: 'credit_score', impact: 'NEGATIVE', weight: 0.35, description: `Poor credit score (${applicantProfile.creditScore})` });
    riskScore += 0.35;
  }

  // DTI ratio
  if (loanDetails.debtToIncomeRatio > 0.45) {
    riskFactors.push({ factor: 'debt_to_income_ratio', impact: 'NEGATIVE', weight: 0.25, description: `High DTI ratio (${(loanDetails.debtToIncomeRatio * 100).toFixed(1)}%)` });
    riskScore += 0.25;
  } else if (loanDetails.debtToIncomeRatio > 0.35) {
    riskFactors.push({ factor: 'debt_to_income_ratio', impact: 'NEGATIVE', weight: 0.10, description: `Elevated DTI ratio (${(loanDetails.debtToIncomeRatio * 100).toFixed(1)}%)` });
    riskScore += 0.10;
  } else {
    riskFactors.push({ factor: 'debt_to_income_ratio', impact: 'POSITIVE', weight: 0.15, description: `Healthy DTI ratio (${(loanDetails.debtToIncomeRatio * 100).toFixed(1)}%)` });
    riskScore -= 0.05;
  }

  // Employment stability
  if (applicantProfile.employmentStatus === 'EMPLOYED') {
    riskFactors.push({ factor: 'employment_stability', impact: 'POSITIVE', weight: 0.15, description: 'Stable employment history' });
    riskScore -= 0.05;
  } else if (applicantProfile.employmentStatus === 'SELF_EMPLOYED') {
    riskFactors.push({ factor: 'employment_stability', impact: 'NEUTRAL', weight: 0.10, description: 'Self-employed — income variability considered' });
    riskScore += 0.05;
  } else if (applicantProfile.employmentStatus === 'UNEMPLOYED') {
    riskFactors.push({ factor: 'employment_stability', impact: 'NEGATIVE', weight: 0.30, description: 'Currently unemployed' });
    riskScore += 0.30;
  }

  // Fraud signal contribution
  if (fraudScore > 0.5) {
    riskFactors.push({ factor: 'fraud_indicators', impact: 'NEGATIVE', weight: 0.20, description: `Elevated fraud signal score (${fraudScore.toFixed(3)})` });
    riskScore += fraudScore * 0.3;
  }

  // Policy flags penalty
  if (policyFlags.length > 0) {
    riskFactors.push({ factor: 'policy_flags', impact: 'NEGATIVE', weight: 0.10, description: `${policyFlags.length} policy flag(s) raised: ${policyFlags.join(', ')}` });
    riskScore += policyFlags.length * 0.05;
  }

  // KYC boost
  if (applicantProfile.kycVerified) {
    riskFactors.push({ factor: 'kyc_verified', impact: 'POSITIVE', weight: 0.05, description: 'KYC verification passed' });
    riskScore -= 0.03;
  }

  riskScore = Math.max(0, Math.min(1, riskScore));

  const recommendation = riskScore > 0.75 ? 'REJECT' : riskScore > 0.55 ? 'MANUAL_REVIEW' : 'APPROVE';
  const confidence = Math.max(0.5, 1 - (riskScore * 0.3));

  let suggestedTerms: SuggestedLoanTerms | undefined;
  if (recommendation === 'APPROVE') {
    const interestRate = 0.05 + riskScore * 0.10;
    const monthlyRate = interestRate / 12;
    const approvedAmount = loanDetails.requestedAmount;
    const monthlyPayment = approvedAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanDetails.termMonths)) / (Math.pow(1 + monthlyRate, loanDetails.termMonths) - 1);

    suggestedTerms = {
      approvedAmount,
      interestRate: parseFloat(interestRate.toFixed(4)),
      termMonths: loanDetails.termMonths,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      conditions: riskScore > 0.4 ? ['Monthly income verification required', 'Auto-debit enrollment required'] : [],
    };
  }

  const riskLevel: RiskLevel = riskScore > 0.75 ? 'CRITICAL' : riskScore > 0.55 ? 'HIGH' : riskScore > 0.35 ? 'MEDIUM' : 'LOW';

  const reasoning = generateReasoning(applicantProfile, loanDetails, riskScore, riskLevel, recommendation, riskFactors);
  const latencyMs = Date.now() - start;

  logger.info('Mock LLM analysis complete', {
    loanRequestId: request.loanRequestId,
    riskScore,
    riskLevel,
    recommendation,
    confidence,
    latencyMs,
    promptVersion,
  });

  return { reasoning, riskScore, recommendation, confidence, riskFactors, suggestedTerms, tokensUsed: Math.floor(800 + Math.random() * 400) };
}

function generateReasoning(
  applicant: AIDecisionRequest['applicantProfile'],
  loan: AIDecisionRequest['loanDetails'],
  riskScore: number,
  riskLevel: RiskLevel,
  recommendation: string,
  factors: RiskFactor[]
): string {
  const positives = factors.filter((f) => f.impact === 'POSITIVE').map((f) => f.description);
  const negatives = factors.filter((f) => f.impact === 'NEGATIVE').map((f) => f.description);

  return [
    `Risk Assessment Summary for ${loan.loanType} loan of $${loan.requestedAmount.toLocaleString()}:`,
    '',
    `Overall Risk Score: ${(riskScore * 100).toFixed(1)}/100 (${riskLevel})`,
    `Recommendation: ${recommendation}`,
    '',
    'Positive Factors:',
    ...positives.map((p) => `  • ${p}`),
    '',
    'Risk Factors:',
    ...negatives.map((n) => `  • ${n}`),
    '',
    `Applicant credit score of ${applicant.creditScore} and annual income of $${applicant.annualIncome.toLocaleString()} result in a ${riskLevel.toLowerCase()} risk profile.`,
    `Requested term of ${loan.termMonths} months with DTI ratio of ${(loan.debtToIncomeRatio * 100).toFixed(1)}%.`,
  ].join('\n');
}
