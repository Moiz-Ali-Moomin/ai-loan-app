import {
  proxyActivities,
  defineSignal,
  setHandler,
  condition,
  log,
  workflowInfo,
} from '@temporalio/workflow';
import type {
  LoanApprovalWorkflowInput,
  LoanApprovalWorkflowOutput,
  HumanApprovalSignal,
  WorkflowStep,
} from '@loan-platform/shared-types';
import { LoanStatus, WorkflowStatus } from '@loan-platform/shared-types';
import type { LoanActivities } from '../activities/index.js';

// Activity proxies — all calls are durable, retried by Temporal
const {
  validateLoanRequest,
  evaluatePolicy,
  runFraudAnalysis,
  runAIRiskAnalysis,
  requestHumanApproval,
  storeAuditRecord,
  publishWorkflowEvent,
  persistArtifactsToMinIO,
  finalizeDecision,
  updateWorkflowStep,
} = proxyActivities<LoanActivities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '30s',
    nonRetryableErrorTypes: ['ValidationError', 'PolicyHardDenyError'],
  },
});

const {
  waitForHumanApprovalTimeout,
} = proxyActivities<LoanActivities>({
  startToCloseTimeout: '25 hours',
  retry: { maximumAttempts: 1 },
});

// Human approval signal
export const humanApprovalSignal = defineSignal<[HumanApprovalSignal]>('humanApprovalSignal');

export async function loanApprovalWorkflow(
  input: LoanApprovalWorkflowInput
): Promise<LoanApprovalWorkflowOutput> {
  const { loanRequestId, tenantId, correlationId, traceContext } = input;
  const { workflowId, runId } = workflowInfo();

  log.info('Loan approval workflow started', { loanRequestId, tenantId, workflowId });

  let humanApprovalDecision: HumanApprovalSignal | null = null;
  let humanApprovalReceived = false;

  // Register signal handler for human approval
  setHandler(humanApprovalSignal, (signal: HumanApprovalSignal) => {
    humanApprovalDecision = signal;
    humanApprovalReceived = true;
    log.info('Human approval signal received', { decision: signal.decision, reviewerId: signal.reviewerId });
  });

  const ctx = { loanRequestId, tenantId, correlationId, traceId: traceContext.traceId, workflowId, runId };

  // ── Step 1: Validate request ──────────────────────────────────────────────
  await updateWorkflowStep({ ...ctx, step: 'VALIDATE_REQUEST' as WorkflowStep, status: 'RUNNING' });
  await publishWorkflowEvent({ ...ctx, step: 'VALIDATE_REQUEST', eventType: 'WORKFLOW_STEP_STARTED' });

  const validationResult = await validateLoanRequest({ loanRequestId, tenantId });

  if (!validationResult.valid) {
    log.warn('Loan request validation failed', { loanRequestId, errors: validationResult.errors });

    await storeAuditRecord({ ...ctx, eventType: 'WORKFLOW_STEP_FAILED', payload: { step: 'VALIDATE_REQUEST', errors: validationResult.errors } });
    await finalizeDecision({ ...ctx, decision: LoanStatus.REJECTED, reason: `Validation failed: ${validationResult.errors.join(', ')}`, decidedBy: 'POLICY' });

    return buildOutput(loanRequestId, LoanStatus.REJECTED, false, workflowId);
  }

  await updateWorkflowStep({ ...ctx, step: 'VALIDATE_REQUEST' as WorkflowStep, status: 'COMPLETED' });

  // ── Step 2: Evaluate OPA Policy ───────────────────────────────────────────
  await updateWorkflowStep({ ...ctx, step: 'EVALUATE_POLICY' as WorkflowStep, status: 'RUNNING' });
  await publishWorkflowEvent({ ...ctx, step: 'EVALUATE_POLICY', eventType: 'WORKFLOW_STEP_STARTED' });

  const policyResult = await evaluatePolicy({ loanRequestId, tenantId, correlationId });

  await storeAuditRecord({ ...ctx, eventType: 'POLICY_EVALUATED', payload: { policyResult } });
  await publishWorkflowEvent({ ...ctx, step: 'EVALUATE_POLICY', eventType: 'POLICY_EVALUATED', details: policyResult });

  if (!policyResult.allow && policyResult.decision === 'DENY') {
    log.warn('Policy hard deny', { loanRequestId, violations: policyResult.violations });
    await updateWorkflowStep({ ...ctx, step: 'EVALUATE_POLICY' as WorkflowStep, status: 'COMPLETED' });
    await finalizeDecision({ ...ctx, decision: LoanStatus.REJECTED, reason: policyResult.violations.map((v: { message: string }) => v.message).join('; '), decidedBy: 'POLICY' });
    return buildOutput(loanRequestId, LoanStatus.REJECTED, false, workflowId);
  }

  await updateWorkflowStep({ ...ctx, step: 'EVALUATE_POLICY' as WorkflowStep, status: 'COMPLETED' });

  // ── Step 3: Fraud Analysis ────────────────────────────────────────────────
  await updateWorkflowStep({ ...ctx, step: 'FRAUD_ANALYSIS' as WorkflowStep, status: 'RUNNING' });

  const fraudResult = await runFraudAnalysis({ loanRequestId, tenantId });

  await storeAuditRecord({ ...ctx, eventType: 'FRAUD_ANALYSIS_COMPLETED', payload: { fraudResult } });
  await updateWorkflowStep({ ...ctx, step: 'FRAUD_ANALYSIS' as WorkflowStep, status: 'COMPLETED' });

  if (fraudResult.fraudScore > 0.9) {
    log.warn('Critical fraud score — auto-reject', { loanRequestId, fraudScore: fraudResult.fraudScore });
    await finalizeDecision({ ...ctx, decision: LoanStatus.REJECTED, reason: 'Fraud risk too high', decidedBy: 'POLICY' });
    return buildOutput(loanRequestId, LoanStatus.REJECTED, false, workflowId);
  }

  // ── Step 4: AI Risk Analysis ──────────────────────────────────────────────
  await updateWorkflowStep({ ...ctx, step: 'AI_RISK_ANALYSIS' as WorkflowStep, status: 'RUNNING' });
  await publishWorkflowEvent({ ...ctx, step: 'AI_RISK_ANALYSIS', eventType: 'WORKFLOW_STEP_STARTED' });

  const aiResult = await runAIRiskAnalysis({
    loanRequestId,
    tenantId,
    fraudScore: fraudResult.fraudScore,
    policyFlags: policyResult.flags?.map((f: { rule: string }) => f.rule) ?? [],
    correlationId,
  });

  await storeAuditRecord({ ...ctx, eventType: 'AI_DECISION_MADE', payload: { aiResult } });
  await publishWorkflowEvent({ ...ctx, step: 'AI_RISK_ANALYSIS', eventType: 'AI_DECISION_MADE', details: { riskScore: aiResult.riskScore, recommendation: aiResult.recommendation } });
  await persistArtifactsToMinIO({ ...ctx, artifactType: 'ai-decision', data: aiResult });
  await updateWorkflowStep({ ...ctx, step: 'AI_RISK_ANALYSIS' as WorkflowStep, status: 'COMPLETED' });

  // ── Step 5: Human Approval (if high risk or policy flag) ──────────────────
  const needsHumanApproval =
    aiResult.riskScore > parseFloat(process.env['HIGH_RISK_THRESHOLD'] ?? '0.75') ||
    policyResult.flags?.some((f: { requiresAction: string }) => f.requiresAction === 'MANUAL_REVIEW') ||
    aiResult.recommendation === 'MANUAL_REVIEW';

  if (needsHumanApproval) {
    log.info('Escalating to human approval', { loanRequestId, riskScore: aiResult.riskScore });

    await updateWorkflowStep({ ...ctx, step: 'HUMAN_APPROVAL' as WorkflowStep, status: 'RUNNING' });
    await storeAuditRecord({ ...ctx, eventType: 'HUMAN_APPROVAL_REQUESTED', payload: { riskScore: aiResult.riskScore, aiRecommendation: aiResult.recommendation } });
    await publishWorkflowEvent({ ...ctx, step: 'HUMAN_APPROVAL', eventType: 'HUMAN_APPROVAL_REQUESTED' });

    const approvalRecord = await requestHumanApproval({
      loanRequestId,
      tenantId,
      workflowId,
      riskScore: aiResult.riskScore,
      aiRecommendation: aiResult.recommendation,
      policyFlags: policyResult.flags?.map((f: { rule: string }) => f.rule) ?? [],
    });

    // Wait up to 24 hours for human decision
    const timeoutMs = parseInt(process.env['HUMAN_APPROVAL_TIMEOUT'] ?? '86400', 10) * 1000;
    const approved = await condition(() => humanApprovalReceived, timeoutMs);

    if (!approved || !humanApprovalDecision) {
      log.warn('Human approval timed out', { loanRequestId, approvalId: approvalRecord.id });
      await storeAuditRecord({ ...ctx, eventType: 'HUMAN_APPROVAL_RECEIVED', payload: { timedOut: true } });
      await finalizeDecision({ ...ctx, decision: LoanStatus.ESCALATED, reason: 'Human approval timeout', decidedBy: 'SYSTEM' });
      return buildOutput(loanRequestId, LoanStatus.ESCALATED, true, workflowId);
    }

    await storeAuditRecord({ ...ctx, eventType: 'HUMAN_APPROVAL_RECEIVED', payload: { decision: humanApprovalDecision.decision, reviewerId: humanApprovalDecision.reviewerId } });
    await updateWorkflowStep({ ...ctx, step: 'HUMAN_APPROVAL' as WorkflowStep, status: 'COMPLETED' });

    const humanDecision = humanApprovalDecision.decision === 'APPROVE' ? LoanStatus.APPROVED : LoanStatus.REJECTED;
    await finalizeDecision({ ...ctx, decision: humanDecision, reason: humanApprovalDecision.reviewerNotes, decidedBy: 'HUMAN', reviewerId: humanApprovalDecision.reviewerId });

    await storeAuditRecord({ ...ctx, eventType: humanDecision === LoanStatus.APPROVED ? 'LOAN_APPROVED' : 'LOAN_REJECTED', payload: { decidedBy: 'HUMAN', reviewerId: humanApprovalDecision.reviewerId } });
    await publishWorkflowEvent({ ...ctx, step: 'FINALIZE_DECISION', eventType: 'WORKFLOW_COMPLETED', details: { decision: humanDecision } });

    return buildOutput(loanRequestId, humanDecision, true, workflowId);
  }

  // ── Step 6: Auto-finalize decision ────────────────────────────────────────
  await updateWorkflowStep({ ...ctx, step: 'FINALIZE_DECISION' as WorkflowStep, status: 'RUNNING' });

  const autoDecision = aiResult.recommendation === 'APPROVE' ? LoanStatus.APPROVED : LoanStatus.REJECTED;
  await finalizeDecision({
    ...ctx,
    decision: autoDecision,
    reason: aiResult.reasoning,
    decidedBy: 'AI',
    aiDecisionId: aiResult.id,
    suggestedTerms: aiResult.suggestedTerms,
  });

  await storeAuditRecord({ ...ctx, eventType: autoDecision === LoanStatus.APPROVED ? 'LOAN_APPROVED' : 'LOAN_REJECTED', payload: { decidedBy: 'AI', riskScore: aiResult.riskScore } });
  await persistArtifactsToMinIO({ ...ctx, artifactType: 'workflow-snapshot', data: { loanRequestId, decision: autoDecision, aiResult, policyResult, fraudResult } });
  await publishWorkflowEvent({ ...ctx, step: 'FINALIZE_DECISION', eventType: 'WORKFLOW_COMPLETED', details: { decision: autoDecision } });
  await updateWorkflowStep({ ...ctx, step: 'FINALIZE_DECISION' as WorkflowStep, status: 'COMPLETED' });

  log.info('Workflow completed', { loanRequestId, decision: autoDecision });

  return buildOutput(loanRequestId, autoDecision, false, workflowId);
}

function buildOutput(
  loanRequestId: string,
  decision: LoanStatus,
  requiresHumanApproval: boolean,
  workflowId: string
): LoanApprovalWorkflowOutput {
  return {
    workflowRunId: workflowId,
    loanRequestId,
    decision,
    requiresHumanApproval,
    completedAt: new Date().toISOString(),
    summary: {
      validationPassed: true,
      policyEvaluation: { passed: true, violations: [], flags: [], requiresManualReview: requiresHumanApproval },
      fraudScore: 0,
      aiRiskScore: 0,
      requiresHumanApproval,
      finalDecision: decision,
      totalDurationMs: 0,
    },
  };
}
