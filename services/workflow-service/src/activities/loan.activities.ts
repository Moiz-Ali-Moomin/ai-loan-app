import { ApplicationFailure } from '@temporalio/activity';
import axios from 'axios';
import { randomUUID } from 'crypto';
import type { Pool } from 'pg';
import type { Client as MinioClient } from 'minio';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic, LoanStatus, type WorkflowStep } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';

const logger = createLogger('workflow-service:activities');

interface ActivityContext {
  loanRequestId: string;
  tenantId: string;
  correlationId: string;
  traceId: string;
  workflowId: string;
  runId: string;
}

interface PolicyResult {
  allow: boolean;
  deny: boolean;
  decision: string;
  violations: Array<{ rule: string; message: string; severity: string; value?: unknown; threshold?: unknown }>;
  flags: Array<{ rule: string; message: string; requiresAction: string }>;
  [key: string]: unknown;
}

interface AIResult {
  id: string;
  riskScore: number;
  recommendation: string;
  reasoning: string;
  suggestedTerms?: unknown;
  [key: string]: unknown;
}

export interface LoanActivities {
  validateLoanRequest(input: { loanRequestId: string; tenantId: string }): Promise<{ valid: boolean; errors: string[] }>;
  evaluatePolicy(input: { loanRequestId: string; tenantId: string; correlationId: string }): Promise<PolicyResult>;
  runFraudAnalysis(input: { loanRequestId: string; tenantId: string }): Promise<{ id: string; fraudScore: number; isSuspicious: boolean; flags: unknown[] }>;
  runAIRiskAnalysis(input: { loanRequestId: string; tenantId: string; fraudScore: number; policyFlags: string[]; correlationId: string }): Promise<AIResult>;
  requestHumanApproval(input: { loanRequestId: string; tenantId: string; workflowId: string; riskScore: number; aiRecommendation: string; policyFlags: string[] }): Promise<{ id: string }>;
  storeAuditRecord(input: ActivityContext & { eventType: string; payload: Record<string, unknown> }): Promise<void>;
  publishWorkflowEvent(input: ActivityContext & { step: string; eventType: string; details?: Record<string, unknown> }): Promise<void>;
  persistArtifactsToMinIO(input: ActivityContext & { artifactType: string; data: unknown }): Promise<string>;
  finalizeDecision(input: ActivityContext & { decision: LoanStatus; reason?: string; decidedBy: string; reviewerId?: string; aiDecisionId?: string; suggestedTerms?: unknown }): Promise<void>;
  updateWorkflowStep(input: ActivityContext & { step: WorkflowStep; status: string }): Promise<void>;
  waitForHumanApprovalTimeout(input: { loanRequestId: string; timeoutMs: number }): Promise<void>;
}

export function createLoanActivities(
  pool: Pool,
  minioClient: MinioClient,
  kafkaProducer: KafkaProducerClient,
  serviceUrls: { policy: string; ai: string; audit: string }
): LoanActivities {
  return {
    async validateLoanRequest({ loanRequestId, tenantId }) {
      return withSpan('workflow-service', 'activity:validateLoanRequest', { loanRequestId }, async () => {
        const { rows } = await pool.query(
          'SELECT * FROM loan_requests WHERE id = $1 AND tenant_id = $2',
          [loanRequestId, tenantId]
        );

        if (rows.length === 0) {
          throw ApplicationFailure.create({ type: 'ValidationError', message: 'Loan request not found' });
        }

        const loan = rows[0];
        const errors: string[] = [];

        if (!loan.applicant_kyc_verified) errors.push('KYC verification required');
        if (loan.requested_amount <= 0) errors.push('Invalid loan amount');
        if (!loan.applicant_national_id) errors.push('National ID is required');
        if (loan.applicant_credit_score < 300) errors.push('Credit score too low');

        logger.info('Loan validation completed', { loanRequestId, valid: errors.length === 0, errors });

        return { valid: errors.length === 0, errors };
      });
    },

    async evaluatePolicy({ loanRequestId, tenantId, correlationId }) {
      return withSpan('workflow-service', 'activity:evaluatePolicy', { loanRequestId }, async () => {
        const { rows } = await pool.query(
          'SELECT * FROM loan_requests WHERE id = $1',
          [loanRequestId]
        );
        const loan = rows[0];

        const response = await axios.post(
          `${serviceUrls.policy}/api/v1/policies/evaluate`,
          {
            policyPath: 'loan/approval',
            loanRequestId,
            tenantId,
            input: {
              loan: {
                requestedAmount: parseFloat(loan.requested_amount),
                loanType: loan.loan_type,
                termMonths: loan.requested_term_months,
                purpose: loan.purpose,
              },
              applicant: {
                creditScore: loan.applicant_credit_score,
                annualIncome: parseFloat(loan.applicant_annual_income),
                existingDebt: parseFloat(loan.applicant_existing_debt ?? 0),
                kycVerified: loan.applicant_kyc_verified,
                employmentStatus: loan.applicant_employment_status,
                age: calculateAge(loan.applicant_date_of_birth),
              },
            },
          },
          { headers: { 'X-Correlation-Id': correlationId } }
        );

        return response.data.data;
      });
    },

    async runFraudAnalysis({ loanRequestId, tenantId }) {
      return withSpan('workflow-service', 'activity:runFraudAnalysis', { loanRequestId }, async () => {
        const { rows } = await pool.query('SELECT * FROM loan_requests WHERE id = $1', [loanRequestId]);
        const loan = rows[0];

        // Deterministic fraud scoring based on applicant features
        let fraudScore = 0.1;
        const flags = [];

        if (loan.applicant_credit_score < 500) { fraudScore += 0.2; flags.push({ type: 'LOW_CREDIT_SCORE', severity: 'MEDIUM', description: 'Credit score below threshold' }); }
        if (parseFloat(loan.requested_amount) > parseFloat(loan.applicant_annual_income) * 5) { fraudScore += 0.3; flags.push({ type: 'INCOME_RATIO_HIGH', severity: 'HIGH', description: 'Loan amount exceeds 5x annual income' }); }
        if (!loan.applicant_kyc_verified) { fraudScore += 0.3; flags.push({ type: 'KYC_NOT_VERIFIED', severity: 'HIGH', description: 'KYC not verified' }); }

        fraudScore = Math.min(fraudScore, 1.0);

        const result = {
          id: randomUUID(),
          loanRequestId,
          fraudScore,
          isSuspicious: fraudScore > 0.5,
          flags,
          modelVersion: 'fraud-v1.2.0',
          analyzedAt: new Date().toISOString(),
        };

        await pool.query(
          `INSERT INTO fraud_analyses (id, loan_request_id, tenant_id, fraud_score, is_suspicious, flags, model_version)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [result.id, loanRequestId, tenantId, fraudScore, result.isSuspicious, JSON.stringify(flags), result.modelVersion]
        );

        logger.info('Fraud analysis completed', { loanRequestId, fraudScore, isSuspicious: result.isSuspicious });
        return result;
      });
    },

    async runAIRiskAnalysis({ loanRequestId, tenantId, fraudScore, policyFlags, correlationId }) {
      return withSpan('workflow-service', 'activity:runAIRiskAnalysis', { loanRequestId }, async () => {
        const { rows } = await pool.query('SELECT * FROM loan_requests WHERE id = $1', [loanRequestId]);
        const loan = rows[0];

        const response = await axios.post(
          `${serviceUrls.ai}/api/v1/ai/analyze`,
          {
            loanRequestId,
            applicantProfile: {
              creditScore: loan.applicant_credit_score,
              annualIncome: parseFloat(loan.applicant_annual_income),
              existingDebt: parseFloat(loan.applicant_existing_debt ?? 0),
              employmentStatus: loan.applicant_employment_status,
              age: calculateAge(loan.applicant_date_of_birth),
              kycVerified: loan.applicant_kyc_verified,
            },
            loanDetails: {
              requestedAmount: parseFloat(loan.requested_amount),
              loanType: loan.loan_type,
              termMonths: loan.requested_term_months,
              purpose: loan.purpose,
              debtToIncomeRatio: parseFloat(loan.applicant_existing_debt ?? 0) / parseFloat(loan.applicant_annual_income),
            },
            fraudScore,
            policyFlags,
            correlationId,
          },
          { headers: { 'X-Correlation-Id': correlationId } }
        );

        return response.data.data;
      });
    },

    async requestHumanApproval({ loanRequestId, tenantId, workflowId, riskScore, aiRecommendation, policyFlags }) {
      return withSpan('workflow-service', 'activity:requestHumanApproval', { loanRequestId }, async () => {
        const approvalId = randomUUID();
        const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { rows: wfRows } = await pool.query('SELECT id FROM workflow_runs WHERE temporal_workflow_id = $1', [workflowId]);
        const workflowRunId = wfRows[0]?.id ?? randomUUID();

        await pool.query(
          `INSERT INTO approval_records (id, loan_request_id, workflow_run_id, tenant_id, reason, risk_score, ai_recommendation, policy_flags, status, due_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9)`,
          [approvalId, loanRequestId, workflowRunId, tenantId, 'High risk score requires human review', riskScore, aiRecommendation, JSON.stringify(policyFlags), dueAt]
        );

        logger.info('Human approval requested', { loanRequestId, approvalId, riskScore });
        return { id: approvalId };
      });
    },

    async storeAuditRecord(input) {
      return withSpan('workflow-service', 'activity:storeAuditRecord', { loanRequestId: input.loanRequestId }, async () => {
        await axios.post(
          `${serviceUrls.audit}/api/v1/audit`,
          {
            tenantId: input.tenantId,
            loanRequestId: input.loanRequestId,
            workflowRunId: input.workflowId,
            eventType: input.eventType,
            actorType: 'SYSTEM',
            serviceName: 'workflow-service',
            payload: input.payload,
            metadata: {
              traceId: input.traceId,
              correlationId: input.correlationId,
              version: '1.0',
              environment: process.env['NODE_ENV'] ?? 'development',
            },
          }
        );
      });
    },

    async publishWorkflowEvent(input) {
      return withSpan('workflow-service', 'activity:publishWorkflowEvent', { loanRequestId: input.loanRequestId }, async () => {
        await kafkaProducer.publish(
          KafkaTopic.WORKFLOW_EVENTS,
          input.eventType,
          {
            workflowRunId: input.workflowId,
            loanRequestId: input.loanRequestId,
            tenantId: input.tenantId,
            eventType: input.eventType,
            step: input.step,
            status: 'RUNNING',
            timestamp: new Date().toISOString(),
            details: input.details,
          },
          { tenantId: input.tenantId, correlationId: input.correlationId, source: 'workflow-service' }
        );
      });
    },

    async persistArtifactsToMinIO(input) {
      return withSpan('workflow-service', 'activity:persistArtifacts', { loanRequestId: input.loanRequestId }, async () => {
        const bucket = input.artifactType === 'ai-decision' ? 'ai-responses' : 'workflow-snapshots';
        const key = `${input.tenantId}/${input.loanRequestId}/${input.artifactType}-${Date.now()}.json`;
        const content = JSON.stringify({ ...(typeof input.data === 'object' && input.data !== null ? input.data : { data: input.data }), _meta: { traceId: input.traceId, correlationId: input.correlationId, timestamp: new Date().toISOString() } });
        const buf = Buffer.from(content);
        await minioClient.putObject(bucket, key, buf, buf.length, { 'Content-Type': 'application/json' });

        logger.debug('Artifact persisted to MinIO', { bucket, key, loanRequestId: input.loanRequestId });
        return key;
      });
    },

    async finalizeDecision(input) {
      return withSpan('workflow-service', 'activity:finalizeDecision', { loanRequestId: input.loanRequestId }, async () => {
        const decisionId = randomUUID();
        const { rows: wfRows } = await pool.query('SELECT id FROM workflow_runs WHERE temporal_workflow_id = $1', [input.workflowId]);
        const workflowRunId = wfRows[0]?.id;

        const suggestedTerms = input.suggestedTerms as { approvedAmount?: number; interestRate?: number; termMonths?: number } | undefined;

        await pool.query(
          `INSERT INTO loan_decisions (id, loan_request_id, workflow_run_id, tenant_id, status, approved_amount, interest_rate, term_months, rejection_reason, decided_by, ai_decision_id, reviewer_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            decisionId,
            input.loanRequestId,
            workflowRunId,
            input.tenantId,
            input.decision,
            input.decision === LoanStatus.APPROVED ? (suggestedTerms?.approvedAmount ?? null) : null,
            input.decision === LoanStatus.APPROVED ? (suggestedTerms?.interestRate ?? null) : null,
            input.decision === LoanStatus.APPROVED ? (suggestedTerms?.termMonths ?? null) : null,
            input.decision !== LoanStatus.APPROVED ? (input.reason ?? null) : null,
            input.decidedBy,
            input.aiDecisionId ?? null,
            input.reviewerId ?? null,
          ]
        );

        await pool.query('UPDATE loan_requests SET status = $1, updated_at = NOW() WHERE id = $2', [input.decision, input.loanRequestId]);
        if (workflowRunId) {
          await pool.query('UPDATE workflow_runs SET status = $1, loan_status = $2, completed_at = NOW(), updated_at = NOW() WHERE id = $3', [
            'COMPLETED', input.decision, workflowRunId,
          ]);
        }

        logger.info('Decision finalized', { loanRequestId: input.loanRequestId, decision: input.decision, decidedBy: input.decidedBy });
      });
    },

    async updateWorkflowStep(input) {
      return withSpan('workflow-service', 'activity:updateWorkflowStep', { loanRequestId: input.loanRequestId }, async () => {
        await pool.query(
          `UPDATE workflow_runs SET current_step = $1, updated_at = NOW() WHERE temporal_workflow_id = $2`,
          [input.step, input.workflowId]
        );
      });
    },

    async waitForHumanApprovalTimeout({ loanRequestId, timeoutMs }) {
      logger.info('Waiting for human approval', { loanRequestId, timeoutMs });
      await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    },
  };
}

function calculateAge(dateOfBirth: string | null): number {
  if (!dateOfBirth) return 30;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  return Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}
