import type { UUID, ISOTimestamp, TenantId } from './common.js';

export enum AuditEventType {
  LOAN_REQUEST_SUBMITTED = 'LOAN_REQUEST_SUBMITTED',
  WORKFLOW_STARTED = 'WORKFLOW_STARTED',
  WORKFLOW_STEP_STARTED = 'WORKFLOW_STEP_STARTED',
  WORKFLOW_STEP_COMPLETED = 'WORKFLOW_STEP_COMPLETED',
  WORKFLOW_STEP_FAILED = 'WORKFLOW_STEP_FAILED',
  POLICY_EVALUATED = 'POLICY_EVALUATED',
  FRAUD_ANALYSIS_COMPLETED = 'FRAUD_ANALYSIS_COMPLETED',
  AI_DECISION_MADE = 'AI_DECISION_MADE',
  HUMAN_APPROVAL_REQUESTED = 'HUMAN_APPROVAL_REQUESTED',
  HUMAN_APPROVAL_RECEIVED = 'HUMAN_APPROVAL_RECEIVED',
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  LOAN_ESCALATED = 'LOAN_ESCALATED',
  WORKFLOW_COMPLETED = 'WORKFLOW_COMPLETED',
  WORKFLOW_FAILED = 'WORKFLOW_FAILED',
  COMPLIANCE_ARTIFACT_STORED = 'COMPLIANCE_ARTIFACT_STORED',
}

export interface AuditRecord {
  id: UUID;
  tenantId: TenantId;
  loanRequestId: UUID;
  workflowRunId?: UUID;
  eventType: AuditEventType;
  actorId?: UUID;
  actorType: 'USER' | 'SYSTEM' | 'AI' | 'POLICY_ENGINE';
  serviceName: string;
  payload: Record<string, unknown>;
  metadata: AuditMetadata;
  hash: string;
  previousHash?: string;
  createdAt: ISOTimestamp;
}

export interface AuditMetadata {
  traceId: string;
  spanId?: string;
  correlationId: string;
  version: string;
  environment: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DecisionLineage {
  loanRequestId: UUID;
  workflowRunId: UUID;
  events: AuditRecord[];
  policyVersions: PolicyVersionRef[];
  aiDecisions: AIDecisionRef[];
  humanApprovals: HumanApprovalRef[];
  timeline: TimelineEntry[];
}

export interface PolicyVersionRef {
  policyName: string;
  version: string;
  evaluatedAt: ISOTimestamp;
  decision: string;
}

export interface AIDecisionRef {
  modelVersion: string;
  promptVersion: string;
  riskScore: number;
  recommendation: string;
  decidedAt: ISOTimestamp;
}

export interface HumanApprovalRef {
  reviewerId: UUID;
  decision: string;
  decidedAt: ISOTimestamp;
}

export interface TimelineEntry {
  timestamp: ISOTimestamp;
  event: string;
  actor: string;
  details: string;
}
