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
    violations: Array<{ rule: string; message: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; value?: unknown; threshold?: unknown }>;
    flags: Array<{ rule: string; message: string; requiresAction: 'MANUAL_REVIEW' | 'ESCALATE' | 'NOTIFY' }>;
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
      // Fail-closed: OPA unavailability is a hard deny — never fall back to local logic.
      // Any policy bypass during an outage is a worse outcome than a blocked loan.
      logger.error('OPA unavailable — failing closed', { policyPath, evaluationId, traceId, err });
      const durationMs = Date.now() - start;
      return {
        id: evaluationId,
        policyPath,
        policyVersion: process.env['POLICY_VERSION'] ?? '1.0.0',
        decision: 'DENY' as PolicyDecision,
        allow: false,
        violations: [
          {
            rule: 'opa_unavailable',
            message: 'Policy engine unavailable — request denied for safety',
            severity: 'CRITICAL',
          },
        ],
        flags: [],
        metadata: {
          policyVersion: process.env['POLICY_VERSION'] ?? '1.0.0',
          evaluationId,
          traceId,
          queryPath: url,
        },
        evaluatedAt: new Date().toISOString(),
        durationMs,
      } satisfies PolicyEvaluationResult;
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

