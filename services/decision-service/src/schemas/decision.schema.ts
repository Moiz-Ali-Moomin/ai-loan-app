import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const DecisionOutcomeSchema = z.enum(['APPROVE', 'REJECT', 'MANUAL_REVIEW', 'ESCALATE']);
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

export const DecisionTypeSchema = z.enum(['UNDERWRITING', 'KYC', 'AML', 'REVIEW']);
export type DecisionType = z.infer<typeof DecisionTypeSchema>;

export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const EscalationReasonSchema = z.enum([
  'LOW_CONFIDENCE',
  'POLICY_CONFLICT',
  'MISSING_DATA',
  'HIGH_AML_RISK',
  'SANCTIONS_PROXIMITY',
  'UNUSUAL_PATTERN',
  'HARD_POLICY_VIOLATION',
  'RETRIEVAL_FAILURE',
]);
export type EscalationReason = z.infer<typeof EscalationReasonSchema>;

// ── Sub-schemas ───────────────────────────────────────────────────────────────

export const CustomerProfileSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  nationalId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  employmentStatus: z.string().optional(),
  annualIncome: z.number().nonnegative().optional(),
  creditScore: z.number().min(300).max(900).optional(),
  existingDebt: z.number().nonnegative().optional(),
  kycVerified: z.boolean().optional(),
  kycVerifiedAt: z.string().optional(),
  pepStatus: z.boolean().optional(),
  sanctionsChecked: z.boolean().optional(),
  nationality: z.string().optional(),
  residencyCountry: z.string().optional(),
});
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string(),
  filename: z.string().optional(),
  storageKey: z.string().optional(),
  verified: z.boolean().default(false),
  verifiedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  issuer: z.string().optional(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const FinancialDataSchema = z.object({
  requestedAmount: z.number().positive(),
  loanType: z.string(),
  termMonths: z.number().positive().int(),
  purpose: z.string().optional(),
  debtToIncomeRatio: z.number().min(0).max(1).optional(),
  collateralValue: z.number().nonnegative().optional(),
  collateralType: z.string().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
  monthlyObligations: z.number().nonnegative().optional(),
  businessRevenue: z.number().nonnegative().optional(),
  businessRegistrationNumber: z.string().optional(),
  industryCode: z.string().optional(),
});
export type FinancialData = z.infer<typeof FinancialDataSchema>;

export const RiskInputsSchema = z.object({
  fraudScore: z.number().min(0).max(1).optional(),
  amlRiskScore: z.number().min(0).max(1).optional(),
  sanctionsHits: z.number().int().nonnegative().optional(),
  pepExposure: z.boolean().optional(),
  adverseMediaHits: z.number().int().nonnegative().optional(),
  transactionAnomalyScore: z.number().min(0).max(1).optional(),
  deviceRiskScore: z.number().min(0).max(1).optional(),
  geoRiskScore: z.number().min(0).max(1).optional(),
  velocityFlags: z.array(z.string()).optional(),
  priorDefaults: z.number().int().nonnegative().optional(),
  bankruptcyHistory: z.boolean().optional(),
  policyFlags: z.array(z.string()).optional(),
});
export type RiskInputs = z.infer<typeof RiskInputsSchema>;

export const WorkflowContextSchema = z.object({
  workflowRunId: z.string().uuid().optional(),
  workflowStep: z.string().optional(),
  retryCount: z.number().int().nonnegative().optional(),
  parentDecisionId: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  reviewerNotes: z.string().optional(),
  jurisdiction: z.string().optional(),
  productLine: z.string().optional(),
  channel: z.string().optional(),
});
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;

// ── Request schemas ───────────────────────────────────────────────────────────

const BaseDecisionRequestSchema = z.object({
  tenant_id: z.string().min(1),
  application_id: z.string().uuid(),
  customer_profile: CustomerProfileSchema,
  documents: z.array(DocumentSchema).optional().default([]),
  financial_data: FinancialDataSchema,
  risk_inputs: RiskInputsSchema.optional().default({}),
  workflow_context: WorkflowContextSchema.optional().default({}),
  correlation_id: z.string().optional(),
  idempotency_key: z.string().optional(),
});

export const UnderwritingDecisionRequestSchema = BaseDecisionRequestSchema;
export type UnderwritingDecisionRequest = z.infer<typeof UnderwritingDecisionRequestSchema>;

export const KYCDecisionRequestSchema = BaseDecisionRequestSchema.extend({
  kyc_check_type: z.enum(['INITIAL', 'REFRESH', 'ENHANCED']).default('INITIAL'),
});
export type KYCDecisionRequest = z.infer<typeof KYCDecisionRequestSchema>;

export const AMLDecisionRequestSchema = BaseDecisionRequestSchema.extend({
  transaction_patterns: z.array(z.object({
    amount: z.number(),
    currency: z.string(),
    counterparty: z.string().optional(),
    channel: z.string().optional(),
    timestamp: z.string(),
  })).optional().default([]),
  screening_type: z.enum(['SANCTIONS', 'PEP', 'ADVERSE_MEDIA', 'FULL']).default('FULL'),
});
export type AMLDecisionRequest = z.infer<typeof AMLDecisionRequestSchema>;

export const ReviewDecisionRequestSchema = BaseDecisionRequestSchema.extend({
  original_decision_id: z.string().uuid(),
  review_reason: z.string(),
  reviewer_id: z.string().uuid().optional(),
});
export type ReviewDecisionRequest = z.infer<typeof ReviewDecisionRequestSchema>;

// ── Response sub-schemas ──────────────────────────────────────────────────────

export const PolicyOutcomeSchema = z.object({
  policy_path: z.string(),
  policy_version: z.string(),
  passed: z.boolean(),
  hard_block: z.boolean(),
  violations: z.array(z.object({
    rule: z.string(),
    message: z.string(),
    severity: z.enum(['ERROR', 'WARNING', 'INFO']),
  })),
  flags: z.array(z.string()),
  evaluation_latency_ms: z.number(),
});
export type PolicyOutcome = z.infer<typeof PolicyOutcomeSchema>;

export const RetrievalResultSchema = z.object({
  document_id: z.string(),
  document_type: z.string(),
  title: z.string(),
  excerpt: z.string(),
  similarity_score: z.number(),
  metadata: z.record(z.unknown()).optional(),
});
export type RetrievalResult = z.infer<typeof RetrievalResultSchema>;

export const RiskSignalSchema = z.object({
  signal: z.string(),
  value: z.number(),
  weight: z.number(),
  impact: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
  description: z.string(),
  source: z.string(),
});
export type RiskSignal = z.infer<typeof RiskSignalSchema>;

export const ConfidenceBreakdownSchema = z.object({
  ai_confidence: z.number().min(0).max(1),
  policy_confidence: z.number().min(0).max(1),
  retrieval_quality: z.number().min(0).max(1),
  data_completeness: z.number().min(0).max(1),
  composite_score: z.number().min(0).max(1),
});
export type ConfidenceBreakdown = z.infer<typeof ConfidenceBreakdownSchema>;

export const ExplanationSchema = z.object({
  summary: z.string(),
  reason_codes: z.array(z.string()),
  supporting_evidence: z.array(z.object({
    source: z.string(),
    excerpt: z.string(),
    relevance: z.string(),
  })),
  policy_references: z.array(z.string()),
  retrieval_references: z.array(z.string()),
  ai_reasoning_excerpt: z.string(),
  decision_logic: z.string(),
});
export type Explanation = z.infer<typeof ExplanationSchema>;

export const DecisionResponseSchema = z.object({
  decision_id: z.string().uuid(),
  application_id: z.string().uuid(),
  tenant_id: z.string(),
  decision_type: DecisionTypeSchema,
  decision: DecisionOutcomeSchema,
  confidence: z.number().min(0).max(1),
  confidence_breakdown: ConfidenceBreakdownSchema,
  risk_level: RiskLevelSchema,
  risk_score: z.number().min(0).max(1),
  risk_signals: z.array(RiskSignalSchema),
  reasons: z.array(z.string()),
  policy_failures: z.array(z.string()),
  policy_outcomes: z.array(PolicyOutcomeSchema),
  recommended_actions: z.array(z.string()),
  escalation_reasons: z.array(EscalationReasonSchema).optional(),
  explanation: ExplanationSchema,
  retrieved_context_count: z.number().int(),
  ai_request_id: z.string().optional(),
  audit_reference: z.string().uuid(),
  workflow_run_id: z.string().uuid().optional(),
  correlation_id: z.string(),
  decision_timestamp: z.string(),
  processing_latency_ms: z.number(),
  pipeline_latency_breakdown: z.object({
    retrieval_ms: z.number(),
    policy_ms: z.number(),
    ai_inference_ms: z.number(),
    scoring_ms: z.number(),
    total_ms: z.number(),
  }),
});
export type DecisionResponse = z.infer<typeof DecisionResponseSchema>;
