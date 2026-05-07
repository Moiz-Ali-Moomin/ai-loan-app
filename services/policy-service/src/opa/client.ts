import axios from 'axios';
import { randomUUID } from 'crypto';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';
import type { PolicyEvaluationResult, PolicyDecision, PolicyInput } from '@loan-platform/shared-types';

const logger = createLogger('policy-service:opa');

const OPA_URL = process.env['OPA_URL'] ?? 'http://localhost:8181';

interface OpaResponse {
  result: {
    allow: boolean;
    deny: boolean;
    violations: Array<{ rule: string; message: string; severity: string; value?: unknown; threshold?: unknown }>;
    flags: Array<{ rule: string; message: string; requiresAction: string }>;
    decision: string;
  };
}

export async function evaluateOpaPolicy(
  policyPath: string,
  input: PolicyInput,
  traceId?: string
): Promise<PolicyEvaluationResult> {
  const start = Date.now();
  const evaluationId = randomUUID();

  return withSpan('policy-service', 'opa:evaluate', { policyPath, traceId: traceId ?? '' }, async () => {
    logger.info('Evaluating OPA policy', { policyPath, evaluationId, traceId });

    const opaPath = policyPath.replace(/\//g, '/');
    const url = `${OPA_URL}/v1/data/${opaPath}`;

    let opaResult: OpaResponse['result'];

    try {
      const response = await axios.post<OpaResponse>(
        url,
        { input },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Evaluation-Id': evaluationId,
          },
          timeout: 5000,
        }
      );
      opaResult = response.data.result;
    } catch (err) {
      logger.error('OPA evaluation failed', { policyPath, err });
      // Fail-safe: if OPA is unavailable, use built-in fallback
      opaResult = fallbackPolicyEvaluation(input);
    }

    const durationMs = Date.now() - start;
    const decision: PolicyDecision = opaResult.decision as PolicyDecision ?? (opaResult.allow ? 'ALLOW' : 'DENY');

    const result: PolicyEvaluationResult = {
      id: evaluationId,
      policyPath,
      policyVersion: process.env['POLICY_VERSION'] ?? '1.0.0',
      decision,
      allow: opaResult.allow ?? false,
      violations: opaResult.violations ?? [],
      flags: opaResult.flags ?? [],
      metadata: {
        policyVersion: process.env['POLICY_VERSION'] ?? '1.0.0',
        evaluationId,
        traceId,
        queryPath: url,
      },
      evaluatedAt: new Date().toISOString(),
      durationMs,
    };

    logger.info('OPA evaluation completed', { evaluationId, decision, durationMs, violationCount: result.violations.length });

    return result;
  });
}

function fallbackPolicyEvaluation(input: PolicyInput): OpaResponse['result'] {
  const violations: OpaResponse['result']['violations'] = [];
  const flags: OpaResponse['result']['flags'] = [];

  if (!input.applicant.kycVerified) {
    violations.push({ rule: 'kyc_required', message: 'KYC verification is required', severity: 'CRITICAL' });
  }
  if (input.applicant.creditScore < 580) {
    violations.push({ rule: 'min_credit_score', message: 'Credit score below minimum threshold (580)', severity: 'HIGH', value: input.applicant.creditScore, threshold: 580 });
  }
  if (input.loan.requestedAmount > 500000) {
    flags.push({ rule: 'high_value_loan', message: 'Loan amount requires manual approval', requiresAction: 'MANUAL_REVIEW' });
  }

  const allow = violations.length === 0;
  return { allow, deny: !allow, violations, flags, decision: allow ? 'ALLOW' : (violations.some(v => v.severity === 'CRITICAL') ? 'DENY' : 'MANUAL_REVIEW') };
}
