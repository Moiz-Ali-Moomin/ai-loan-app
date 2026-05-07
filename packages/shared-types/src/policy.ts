import type { UUID, ISOTimestamp, TenantId } from './common';

export enum PolicyDecision {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  ESCALATE = 'ESCALATE',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export interface PolicyVersion {
  id: UUID;
  name: string;
  version: string;
  tenantId?: TenantId;
  content: string;
  description: string;
  effectiveFrom: ISOTimestamp;
  effectiveTo?: ISOTimestamp;
  isActive: boolean;
  createdBy: UUID;
  createdAt: ISOTimestamp;
  checksum: string;
}

export interface PolicyEvaluationRequest {
  policyPath: string;
  input: PolicyInput;
  tenantId?: TenantId;
  traceId?: string;
}

export interface PolicyInput {
  loan: {
    requestedAmount: number;
    loanType: string;
    termMonths: number;
    purpose: string;
  };
  applicant: {
    creditScore: number;
    annualIncome: number;
    existingDebt: number;
    kycVerified: boolean;
    employmentStatus: string;
    age: number;
  };
  riskScore?: number;
  fraudScore?: number;
  tenantId?: string;
}

export interface PolicyEvaluationResult {
  id: UUID;
  policyPath: string;
  policyVersion: string;
  decision: PolicyDecision;
  allow: boolean;
  violations: PolicyViolation[];
  flags: PolicyFlag[];
  metadata: PolicyEvalMetadata;
  evaluatedAt: ISOTimestamp;
  durationMs: number;
}

export interface PolicyViolation {
  rule: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  value?: unknown;
  threshold?: unknown;
}

export interface PolicyFlag {
  rule: string;
  message: string;
  requiresAction: 'MANUAL_REVIEW' | 'ESCALATE' | 'NOTIFY';
}

export interface PolicyEvalMetadata {
  policyVersion: string;
  evaluationId: UUID;
  tenantId?: TenantId;
  traceId?: string;
  queryPath: string;
}
