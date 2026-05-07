import type { UUID, ISOTimestamp } from './common.js';

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AIDecisionRequest {
  loanRequestId: UUID;
  applicantProfile: {
    creditScore: number;
    annualIncome: number;
    existingDebt: number;
    employmentStatus: string;
    age: number;
    kycVerified: boolean;
  };
  loanDetails: {
    requestedAmount: number;
    loanType: string;
    termMonths: number;
    purpose: string;
    debtToIncomeRatio: number;
  };
  fraudScore: number;
  policyFlags: string[];
  correlationId: string;
}

export interface AIDecisionResult {
  id: UUID;
  loanRequestId: UUID;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  confidence: number;
  reasoning: string;
  riskFactors: RiskFactor[];
  suggestedTerms?: SuggestedLoanTerms;
  modelVersion: string;
  promptVersion: string;
  promptStorageKey: string;
  responseStorageKey: string;
  tokensUsed: number;
  latencyMs: number;
  decidedAt: ISOTimestamp;
}

export interface RiskFactor {
  factor: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  weight: number;
  description: string;
}

export interface SuggestedLoanTerms {
  approvedAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  conditions: string[];
}

export interface FraudAnalysisResult {
  id: UUID;
  loanRequestId: UUID;
  fraudScore: number;
  isSuspicious: boolean;
  flags: FraudFlag[];
  modelVersion: string;
  analyzedAt: ISOTimestamp;
}

export interface FraudFlag {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface PromptVersion {
  id: UUID;
  name: string;
  version: string;
  template: string;
  model: string;
  maxTokens: number;
  temperature: number;
  storageKey: string;
  isActive: boolean;
  createdAt: ISOTimestamp;
}
