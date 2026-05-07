import type { UUID, ISOTimestamp, TenantId } from './common.js';
import type { LoanStatus } from './loan.js';

export enum WorkflowStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMED_OUT = 'TIMED_OUT',
  WAITING_FOR_SIGNAL = 'WAITING_FOR_SIGNAL',
}

export enum WorkflowStep {
  VALIDATE_REQUEST = 'VALIDATE_REQUEST',
  EVALUATE_POLICY = 'EVALUATE_POLICY',
  FRAUD_ANALYSIS = 'FRAUD_ANALYSIS',
  AI_RISK_ANALYSIS = 'AI_RISK_ANALYSIS',
  HUMAN_APPROVAL = 'HUMAN_APPROVAL',
  STORE_AUDIT = 'STORE_AUDIT',
  PUBLISH_EVENTS = 'PUBLISH_EVENTS',
  PERSIST_ARTIFACTS = 'PERSIST_ARTIFACTS',
  FINALIZE_DECISION = 'FINALIZE_DECISION',
}

export interface WorkflowRun {
  id: UUID;
  temporalWorkflowId: string;
  temporalRunId: string;
  loanRequestId: UUID;
  tenantId: TenantId;
  status: WorkflowStatus;
  currentStep: WorkflowStep;
  loanStatus: LoanStatus;
  startedAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
  failureReason?: string;
  steps: WorkflowStepRecord[];
  metadata: WorkflowMetadata;
}

export interface WorkflowStepRecord {
  step: WorkflowStep;
  startedAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  durationMs?: number;
  output?: Record<string, unknown>;
  error?: string;
  retryCount: number;
}

export interface WorkflowMetadata {
  policyVersion: string;
  aiModelVersion: string;
  fraudModelVersion: string;
  traceId: string;
  correlationId: string;
}

export interface LoanApprovalWorkflowInput {
  loanRequestId: UUID;
  tenantId: TenantId;
  correlationId: string;
  traceContext: {
    traceId: string;
    spanId: string;
  };
}

export interface LoanApprovalWorkflowOutput {
  workflowRunId: UUID;
  loanRequestId: UUID;
  decision: LoanStatus;
  requiresHumanApproval: boolean;
  completedAt: ISOTimestamp;
  summary: WorkflowSummary;
}

export interface WorkflowSummary {
  validationPassed: boolean;
  policyEvaluation: PolicyEvaluationSummary;
  fraudScore: number;
  aiRiskScore: number;
  requiresHumanApproval: boolean;
  finalDecision: LoanStatus;
  totalDurationMs: number;
}

export interface PolicyEvaluationSummary {
  passed: boolean;
  violations: string[];
  flags: string[];
  requiresManualReview: boolean;
}

export interface HumanApprovalSignal {
  decision: 'APPROVE' | 'REJECT';
  reviewerId: UUID;
  reviewerNotes: string;
  decidedAt: ISOTimestamp;
}
