import type { UUID, ISOTimestamp, TenantId } from './common.js';

export enum KafkaTopic {
  LOAN_REQUESTS = 'loan.requests',
  WORKFLOW_EVENTS = 'workflow.events',
  POLICY_EVENTS = 'policy.events',
  AI_DECISIONS = 'ai.decisions',
  AUDIT_EVENTS = 'audit.events',
}

export interface KafkaEventEnvelope<T = unknown> {
  id: UUID;
  topic: KafkaTopic;
  eventType: string;
  version: string;
  source: string;
  tenantId: TenantId;
  correlationId: string;
  traceId: string;
  timestamp: ISOTimestamp;
  payload: T;
  metadata?: Record<string, unknown>;
}

export interface LoanRequestEvent {
  loanRequestId: UUID;
  tenantId: TenantId;
  applicantId: UUID;
  requestedAmount: number;
  loanType: string;
  submittedAt: ISOTimestamp;
}

export interface WorkflowEvent {
  workflowRunId: UUID;
  loanRequestId: UUID;
  tenantId: TenantId;
  eventType: string;
  step?: string;
  status: string;
  timestamp: ISOTimestamp;
  details?: Record<string, unknown>;
}

export interface PolicyEvent {
  evaluationId: UUID;
  loanRequestId: UUID;
  tenantId: TenantId;
  policyPath: string;
  policyVersion: string;
  decision: string;
  violations: string[];
  flags: string[];
  evaluatedAt: ISOTimestamp;
}

export interface AIDecisionEvent {
  decisionId: UUID;
  loanRequestId: UUID;
  tenantId: TenantId;
  riskScore: number;
  riskLevel: string;
  recommendation: string;
  confidence: number;
  modelVersion: string;
  decidedAt: ISOTimestamp;
}

export interface AuditEvent {
  auditId: UUID;
  loanRequestId: UUID;
  tenantId: TenantId;
  eventType: string;
  actorType: string;
  serviceName: string;
  timestamp: ISOTimestamp;
}
