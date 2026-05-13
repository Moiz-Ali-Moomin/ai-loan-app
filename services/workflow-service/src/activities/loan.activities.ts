import { ApplicationFailure } from '@temporalio/activity';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { prisma as _prisma } from '@loan-platform/database';
import type { Client as MinioClient } from 'minio';
import type { KafkaProducerClient } from '@loan-platform/kafka';
import { KafkaTopic, LoanStatus, type WorkflowStep } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';
import { withSpan } from '@loan-platform/telemetry';

const logger = createLogger('workflow-service:activities');

type Prisma = typeof _prisma;

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
  prisma: Prisma,
  minioClient: MinioClient,
  kafkaProducer: KafkaProducerClient,
  serviceUrls: { policy: string; ai: string; audit: string }
): LoanActivities {
  return {
    async validateLoanRequest({ loanRequestId, tenantId }) {
      return withSpan('workflow-service', 'activity:validateLoanRequest', { loanRequestId }, async () => {
        const loan = await prisma.loanRequest.findFirst({
          where: { id: loanRequestId, tenantId },
        });

        if (!loan) {
          throw ApplicationFailure.create({ type: 'ValidationError', message: 'Loan request not found' });
        }

        const errors: string[] = [];

        if (!loan.applicantKycVerified) errors.push('KYC verification required');
        if (Number(loan.requestedAmount) <= 0) errors.push('Invalid loan amount');
        if (!loan.applicantNationalId) errors.push('National ID is required');
        if ((loan.applicantCreditScore ?? 0) < 300) errors.push('Credit score too low');

        logger.info('Loan validation completed', { loanRequestId, valid: errors.length === 0, errors });

        return { valid: errors.length === 0, errors };
      });
    },

    async evaluatePolicy({ loanRequestId, tenantId, correlationId }) {
      return withSpan('workflow-service', 'activity:evaluatePolicy', { loanRequestId }, async () => {
        const loan = await prisma.loanRequest.findFirst({ where: { id: loanRequestId } });
        if (!loan) throw ApplicationFailure.create({ type: 'ValidationError', message: 'Loan request not found' });

        const response = await axios.post(
          `${serviceUrls.policy}/api/v1/policies/evaluate`,
          {
            policyPath: 'loan/approval',
            loanRequestId,
            tenantId,
            input: {
              loan: {
                requestedAmount: Number(loan.requestedAmount),
                loanType: loan.loanType,
                termMonths: loan.requestedTermMonths,
                purpose: loan.purpose,
              },
              applicant: {
                creditScore: loan.applicantCreditScore,
                annualIncome: Number(loan.applicantAnnualIncome ?? 0),
                existingDebt: Number(loan.applicantExistingDebt ?? 0),
                kycVerified: loan.applicantKycVerified,
                employmentStatus: loan.applicantEmploymentStatus,
                age: calculateAge(loan.applicantDateOfBirth),
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
        const loan = await prisma.loanRequest.findFirst({ where: { id: loanRequestId } });
        if (!loan) throw ApplicationFailure.create({ type: 'ValidationError', message: 'Loan request not found' });

        let fraudScore = 0.1;
        const flags = [];

        if ((loan.applicantCreditScore ?? 850) < 500) { fraudScore += 0.2; flags.push({ type: 'LOW_CREDIT_SCORE', severity: 'MEDIUM', description: 'Credit score below threshold' }); }
        if (Number(loan.requestedAmount) > Number(loan.applicantAnnualIncome ?? 0) * 5) { fraudScore += 0.3; flags.push({ type: 'INCOME_RATIO_HIGH', severity: 'HIGH', description: 'Loan amount exceeds 5x annual income' }); }
        if (!loan.applicantKycVerified) { fraudScore += 0.3; flags.push({ type: 'KYC_NOT_VERIFIED', severity: 'HIGH', description: 'KYC not verified' }); }

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

        await prisma.fraudAnalysis.create({
          data: {
            id: result.id,
            loanRequestId,
            tenantId,
            fraudScore,
            isSuspicious: result.isSuspicious,
            flags: flags as object[],
            modelVersion: result.modelVersion,
          },
        });

        logger.info('Fraud analysis completed', { loanRequestId, fraudScore, isSuspicious: result.isSuspicious });
        return result;
      });
    },

    async runAIRiskAnalysis({ loanRequestId, tenantId, fraudScore, policyFlags, correlationId }) {
      return withSpan('workflow-service', 'activity:runAIRiskAnalysis', { loanRequestId }, async () => {
        const loan = await prisma.loanRequest.findFirst({ where: { id: loanRequestId } });
        if (!loan) throw ApplicationFailure.create({ type: 'ValidationError', message: 'Loan request not found' });

        const response = await axios.post(
          `${serviceUrls.ai}/api/v1/ai/analyze`,
          {
            loanRequestId,
            tenantId,
            applicantProfile: {
              creditScore: loan.applicantCreditScore,
              annualIncome: Number(loan.applicantAnnualIncome ?? 0),
              existingDebt: Number(loan.applicantExistingDebt ?? 0),
              employmentStatus: loan.applicantEmploymentStatus,
              age: calculateAge(loan.applicantDateOfBirth),
              kycVerified: loan.applicantKycVerified,
            },
            loanDetails: {
              requestedAmount: Number(loan.requestedAmount),
              loanType: loan.loanType,
              termMonths: loan.requestedTermMonths,
              purpose: loan.purpose,
              debtToIncomeRatio: Number(loan.applicantExistingDebt ?? 0) / Number(loan.applicantAnnualIncome ?? 1),
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
        const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const workflowRun = await prisma.workflowRun.findFirst({
          where: { temporalWorkflowId: workflowId },
          select: { id: true },
        });

        await prisma.approvalRecord.create({
          data: {
            id: approvalId,
            loanRequestId,
            workflowRunId: workflowRun?.id ?? randomUUID(),
            tenantId,
            reason: 'High risk score requires human review',
            riskScore,
            aiRecommendation,
            policyFlags: policyFlags as unknown as object[],
            status: 'PENDING',
            dueAt,
          },
        });

        logger.info('Human approval requested', { loanRequestId, approvalId, riskScore });
        return { id: approvalId };
      });
    },

    async storeAuditRecord(input) {
      return withSpan('workflow-service', 'activity:storeAuditRecord', { loanRequestId: input.loanRequestId }, async () => {
        const workflowRun = await prisma.workflowRun.findFirst({
          where: { temporalWorkflowId: input.workflowId },
          select: { id: true },
        });
        await axios.post(
          `${serviceUrls.audit}/api/v1/audit`,
          {
            tenantId: input.tenantId,
            loanRequestId: input.loanRequestId,
            workflowRunId: workflowRun?.id ?? null,
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
        const workflowRun = await prisma.workflowRun.findFirst({
          where: { temporalWorkflowId: input.workflowId },
          select: { id: true },
        });

        const suggestedTerms = input.suggestedTerms as { approvedAmount?: number; interestRate?: number; termMonths?: number } | undefined;

        await prisma.loanDecision.create({
          data: {
            loanRequestId: input.loanRequestId,
            workflowRunId: workflowRun?.id ?? null,
            tenantId: input.tenantId,
            status: input.decision,
            approvedAmount: input.decision === LoanStatus.APPROVED ? (suggestedTerms?.approvedAmount ?? null) : null,
            interestRate: input.decision === LoanStatus.APPROVED ? (suggestedTerms?.interestRate ?? null) : null,
            termMonths: input.decision === LoanStatus.APPROVED ? (suggestedTerms?.termMonths ?? null) : null,
            rejectionReason: input.decision !== LoanStatus.APPROVED ? (input.reason ?? null) : null,
            decidedBy: input.decidedBy,
            aiDecisionId: input.aiDecisionId ?? null,
            reviewerId: input.reviewerId ?? null,
          },
        });

        await prisma.loanRequest.update({
          where: { id: input.loanRequestId },
          data: { status: input.decision },
        });

        if (workflowRun?.id) {
          await prisma.workflowRun.update({
            where: { id: workflowRun.id },
            data: { status: 'COMPLETED', loanStatus: input.decision, completedAt: new Date() },
          });
        }

        logger.info('Decision finalized', { loanRequestId: input.loanRequestId, decision: input.decision, decidedBy: input.decidedBy });
      });
    },

    async updateWorkflowStep(input) {
      return withSpan('workflow-service', 'activity:updateWorkflowStep', { loanRequestId: input.loanRequestId }, async () => {
        await prisma.workflowRun.updateMany({
          where: { temporalWorkflowId: input.workflowId },
          data: { currentStep: input.step },
        });
      });
    },

    async waitForHumanApprovalTimeout({ loanRequestId, timeoutMs }) {
      logger.info('Waiting for human approval', { loanRequestId, timeoutMs });
      await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    },
  };
}

function calculateAge(dateOfBirth: Date | null): number {
  if (!dateOfBirth) return 30;
  const today = new Date();
  return Math.floor((today.getTime() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}
