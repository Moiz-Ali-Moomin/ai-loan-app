import { Injectable } from '@nestjs/common';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type {
  PolicyOutcome,
  UnderwritingDecisionRequest,
  KYCDecisionRequest,
  AMLDecisionRequest,
} from '../schemas/decision.schema';

const logger = createLogger('decision-service:policy');

interface OPAViolation { rule: string; message: string; severity: 'ERROR' | 'WARNING' | 'INFO' }
interface OPAFlag { rule: string; message: string }
interface OPAResult {
  id: string;
  allow: boolean;
  decision: 'ALLOW' | 'DENY' | 'MANUAL_REVIEW';
  policyVersion: string;
  violations: OPAViolation[];
  flags: OPAFlag[];
  evaluatedAt: string;
  durationMs: number;
}

type DecisionRequest = UnderwritingDecisionRequest | KYCDecisionRequest | AMLDecisionRequest;

export interface PolicyEvaluationOutput {
  outcomes: PolicyOutcome[];
  hardBlocked: boolean;
  allPassed: boolean;
  policyFailures: string[];
  totalLatencyMs: number;
}

const UNDERWRITING_POLICIES = ['loan/underwriting', 'loan/credit_risk', 'loan/income_verification'];
const KYC_POLICIES = ['kyc/identity_verification', 'kyc/document_completeness', 'kyc/pep_screening'];
const AML_POLICIES = ['aml/transaction_monitoring', 'aml/sanctions_screening', 'aml/adverse_media'];

@Injectable()
export class PolicyEvaluator {
  private readonly policyServiceUrl: string;

  constructor() {
    this.policyServiceUrl = process.env['POLICY_SERVICE_URL'] ?? 'http://localhost:3002';
  }

  async evaluateUnderwriting(request: UnderwritingDecisionRequest, traceId: string): Promise<PolicyEvaluationOutput> {
    return this.evaluatePolicies(UNDERWRITING_POLICIES, request, traceId);
  }

  async evaluateKYC(request: KYCDecisionRequest, traceId: string): Promise<PolicyEvaluationOutput> {
    return this.evaluatePolicies(KYC_POLICIES, request, traceId);
  }

  async evaluateAML(request: AMLDecisionRequest, traceId: string): Promise<PolicyEvaluationOutput> {
    return this.evaluatePolicies(AML_POLICIES, request, traceId);
  }

  async evaluateAll(request: DecisionRequest, traceId: string): Promise<PolicyEvaluationOutput> {
    return this.evaluatePolicies([...UNDERWRITING_POLICIES, ...KYC_POLICIES], request, traceId);
  }

  private async evaluatePolicies(
    policies: string[],
    request: DecisionRequest,
    traceId: string
  ): Promise<PolicyEvaluationOutput> {
    const totalStart = Date.now();

    return withSpan('decision-service', 'policy:evaluate-all', { policyCount: policies.length }, async () => {
      const opaInput = this.buildOpaInput(request);

      const evaluations = await Promise.allSettled(
        policies.map(path =>
          this.evaluateSingle(path, opaInput, request.application_id, request.tenant_id, traceId)
        )
      );

      const outcomes: PolicyOutcome[] = [];
      const policyFailures: string[] = [];
      let hardBlocked = false;

      for (let i = 0; i < evaluations.length; i++) {
        const result = evaluations[i];
        const policyPath = policies[i] ?? 'unknown';

        if (result.status === 'fulfilled') {
          outcomes.push(result.value);
          if (!result.value.passed) {
            if (result.value.hard_block) hardBlocked = true;
            for (const v of result.value.violations) {
              policyFailures.push(`${policyPath}: ${v.message}`);
            }
          }
        } else {
          logger.error('Policy evaluation failed', { policyPath, err: result.reason, traceId });
          outcomes.push({
            policy_path: policyPath,
            policy_version: 'unknown',
            passed: false,
            hard_block: false,
            violations: [{ rule: 'evaluation_error', message: 'Policy evaluation unavailable', severity: 'WARNING' }],
            flags: ['POLICY_EVALUATION_ERROR'],
            evaluation_latency_ms: 0,
          });
          policyFailures.push(`${policyPath}: evaluation unavailable`);
        }
      }

      return {
        outcomes,
        hardBlocked,
        allPassed: policyFailures.length === 0,
        policyFailures,
        totalLatencyMs: Date.now() - totalStart,
      };
    });
  }

  private async evaluateSingle(
    policyPath: string,
    opaInput: Record<string, unknown>,
    applicationId: string,
    tenantId: string,
    traceId: string
  ): Promise<PolicyOutcome> {
    const start = Date.now();

    return withSpan('decision-service', `policy:evaluate:${policyPath}`, {}, async () => {
      const resp = await fetch(`${this.policyServiceUrl}/api/v1/policies/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': traceId,
          'x-correlation-id': applicationId,
        },
        body: JSON.stringify({ policyPath, loanRequestId: applicationId, input: opaInput, tenantId, traceId }),
        signal: AbortSignal.timeout(8000),
      });

      if (!resp.ok) throw new Error(`Policy service returned ${resp.status} for ${policyPath}`);

      const body = await resp.json() as { success: boolean; data: OPAResult };
      const data = body.data;
      const latencyMs = Date.now() - start;

      return {
        policy_path: policyPath,
        policy_version: data.policyVersion,
        passed: data.allow,
        hard_block: data.decision === 'DENY' && data.violations.some(v => v.severity === 'ERROR'),
        violations: data.violations.map(v => ({ rule: v.rule, message: v.message, severity: v.severity })),
        flags: data.flags.map(f => f.rule),
        evaluation_latency_ms: latencyMs,
      };
    });
  }

  private buildOpaInput(request: DecisionRequest): Record<string, unknown> {
    const profile = request.customer_profile;
    const financial = request.financial_data;
    const risk = request.risk_inputs ?? {};

    return {
      loan: {
        requestedAmount: financial.requestedAmount,
        loanType: financial.loanType,
        termMonths: financial.termMonths,
        purpose: financial.purpose ?? '',
        debtToIncomeRatio: financial.debtToIncomeRatio ?? 0,
        collateralValue: financial.collateralValue ?? 0,
      },
      applicant: {
        creditScore: profile.creditScore ?? 0,
        annualIncome: profile.annualIncome ?? 0,
        existingDebt: profile.existingDebt ?? 0,
        kycVerified: profile.kycVerified ?? false,
        employmentStatus: profile.employmentStatus ?? 'UNKNOWN',
        age: this.computeAge(profile.dateOfBirth),
        pepStatus: profile.pepStatus ?? false,
        sanctionsChecked: profile.sanctionsChecked ?? false,
        nationality: profile.nationality ?? '',
        residencyCountry: profile.residencyCountry ?? '',
      },
      riskScore: risk.amlRiskScore ?? 0,
      fraudScore: risk.fraudScore ?? 0,
      sanctionsHits: risk.sanctionsHits ?? 0,
      tenantId: request.tenant_id,
    };
  }

  private computeAge(dateOfBirth?: string): number {
    if (!dateOfBirth) return 0;
    const ageDiff = Date.now() - new Date(dateOfBirth).getTime();
    return Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000));
  }
}
