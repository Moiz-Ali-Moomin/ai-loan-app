import type { UUID, ISOTimestamp, TenantId } from './common.js';

export enum LoanStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  AWAITING_HUMAN_APPROVAL = 'AWAITING_HUMAN_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  CANCELLED = 'CANCELLED',
}

export enum LoanType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
  MORTGAGE = 'MORTGAGE',
  AUTO = 'AUTO',
  STUDENT = 'STUDENT',
}

export enum EmploymentStatus {
  EMPLOYED = 'EMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  RETIRED = 'RETIRED',
}

export interface ApplicantProfile {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  address: Address;
  employmentStatus: EmploymentStatus;
  annualIncome: number;
  creditScore: number;
  existingDebt: number;
  kycVerified: boolean;
  kycVerifiedAt?: ISOTimestamp;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LoanRequest {
  id: UUID;
  tenantId: TenantId;
  applicant: ApplicantProfile;
  loanType: LoanType;
  requestedAmount: number;
  requestedTermMonths: number;
  purpose: string;
  collateral?: CollateralInfo;
  businessInfo?: BusinessInfo;
  submittedAt: ISOTimestamp;
  metadata?: Record<string, unknown>;
}

export interface CollateralInfo {
  type: string;
  estimatedValue: number;
  description: string;
}

export interface BusinessInfo {
  name: string;
  registrationNumber: string;
  annualRevenue: number;
  yearsInOperation: number;
  industryCode: string;
}

export interface LoanDecision {
  id: UUID;
  loanRequestId: UUID;
  tenantId: TenantId;
  status: LoanStatus;
  approvedAmount?: number;
  interestRate?: number;
  termMonths?: number;
  rejectionReason?: string;
  conditions?: string[];
  decidedAt: ISOTimestamp;
  decidedBy: 'AI' | 'HUMAN' | 'POLICY';
  workflowRunId: UUID;
  policyVersion: string;
  aiDecisionId?: UUID;
  reviewerId?: UUID;
}

export interface HumanApprovalRequest {
  id: UUID;
  loanRequestId: UUID;
  workflowRunId: UUID;
  reviewerId?: UUID;
  reason: string;
  riskScore: number;
  aiRecommendation: string;
  policyFlags: string[];
  assignedAt: ISOTimestamp;
  dueAt: ISOTimestamp;
  completedAt?: ISOTimestamp;
  decision?: 'APPROVE' | 'REJECT';
  reviewerNotes?: string;
}

export interface CreateLoanRequestDto {
  tenantId: TenantId;
  applicant: Omit<ApplicantProfile, 'id'>;
  loanType: LoanType;
  requestedAmount: number;
  requestedTermMonths: number;
  purpose: string;
  collateral?: CollateralInfo;
  businessInfo?: BusinessInfo;
}
