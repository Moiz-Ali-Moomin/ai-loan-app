import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type { UnderwritingDecisionRequest, KYCDecisionRequest, AMLDecisionRequest } from '../schemas/decision.schema.js';

const logger = createLogger('decision-service:reasoning');

export interface AIReasoningOutput {
  requestId: string;
  riskScore: number;
  confidence: number;
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  reasoning: string;
  riskFactors: Array<{
    factor: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    weight: number;
    description: string;
  }>;
  suggestedTerms?: {
    approvedAmount: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    conditions: string[];
  };
  modelVersion: string;
  tokensUsed: number;
  latencyMs: number;
}

type DecisionRequest = UnderwritingDecisionRequest | KYCDecisionRequest | AMLDecisionRequest;

@Injectable()
export class AIReasoningClient {
  private readonly aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl = process.env['AI_SERVICE_URL'] ?? 'http://localhost:3003';
  }

  async reason(request: DecisionRequest, contextAddendum: string, traceId: string): Promise<AIReasoningOutput> {
    const start = Date.now();

    return withSpan('decision-service', 'reasoning:ai-inference', {
      tenantId: request.tenant_id,
      applicationId: request.application_id,
    }, async () => {
      const profile = request.customer_profile;
      const financial = request.financial_data;
      const risk = request.risk_inputs ?? {};

      const aiPayload = {
        loanRequestId: request.application_id,
        tenantId: request.tenant_id,
        correlationId: request.correlation_id ?? request.application_id,
        applicantProfile: {
          creditScore: profile.creditScore ?? 0,
          annualIncome: profile.annualIncome ?? 0,
          existingDebt: profile.existingDebt ?? 0,
          employmentStatus: profile.employmentStatus ?? 'UNKNOWN',
          age: this.computeAge(profile.dateOfBirth),
          kycVerified: profile.kycVerified ?? false,
        },
        loanDetails: {
          requestedAmount: financial.requestedAmount,
          loanType: financial.loanType,
          termMonths: financial.termMonths,
          purpose: financial.purpose ?? '',
          debtToIncomeRatio: financial.debtToIncomeRatio ?? 0,
        },
        fraudScore: risk.fraudScore ?? 0,
        policyFlags: [
          ...(risk.policyFlags ?? []),
          ...(risk.velocityFlags ?? []),
          ...(risk.sanctionsHits && risk.sanctionsHits > 0 ? ['SANCTIONS_HIT'] : []),
          ...(risk.pepExposure ? ['PEP_EXPOSURE'] : []),
          ...(risk.adverseMediaHits && risk.adverseMediaHits > 0 ? ['ADVERSE_MEDIA'] : []),
        ],
        systemContextAddendum: contextAddendum,
      };

      try {
        const resp = await fetch(`${this.aiServiceUrl}/api/v1/ai/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-trace-id': traceId,
            'x-correlation-id': request.correlation_id ?? request.application_id,
            'x-source': 'decision-service',
          },
          body: JSON.stringify(aiPayload),
          signal: AbortSignal.timeout(30000),
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`AI service returned ${resp.status}: ${errText}`);
        }

        const body = await resp.json() as { success: boolean; data: Record<string, unknown> };
        const data = body.data;
        const latencyMs = Date.now() - start;

        logger.info('AI reasoning completed', {
          applicationId: request.application_id,
          riskScore: data['riskScore'],
          confidence: data['confidence'],
          recommendation: data['recommendation'],
          latencyMs,
        });

        return {
          requestId: data['id'] as string,
          riskScore: data['riskScore'] as number,
          confidence: data['confidence'] as number,
          recommendation: data['recommendation'] as 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW',
          reasoning: data['reasoning'] as string,
          riskFactors: data['riskFactors'] as AIReasoningOutput['riskFactors'],
          suggestedTerms: data['suggestedTerms'] as AIReasoningOutput['suggestedTerms'],
          modelVersion: data['modelVersion'] as string,
          tokensUsed: (data['tokensUsed'] as number) ?? 0,
          latencyMs,
        };
      } catch (err) {
        logger.error('AI reasoning failed — escalating', { err, applicationId: request.application_id });
        return this.escalateFallback(request.application_id, Date.now() - start);
      }
    });
  }

  private escalateFallback(applicationId: string, latencyMs: number): AIReasoningOutput {
    return {
      requestId: applicationId,
      riskScore: 1.0,
      confidence: 0.0,
      recommendation: 'MANUAL_REVIEW',
      reasoning: 'AI reasoning service unavailable — escalating for human review',
      riskFactors: [{
        factor: 'ai_service_unavailable',
        impact: 'NEGATIVE',
        weight: 1.0,
        description: 'Could not obtain AI risk analysis — requires manual review',
      }],
      modelVersion: 'fallback',
      tokensUsed: 0,
      latencyMs,
    };
  }

  private computeAge(dateOfBirth?: string): number {
    if (!dateOfBirth) return 0;
    return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
}
