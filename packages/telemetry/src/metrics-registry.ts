import { metrics } from '@opentelemetry/api';

const METER_NAME = 'loan-platform';

// Instruments are module-level singletons. getMeter returns the same Meter
// instance for a given name, and each createCounter/createHistogram call with
// the same name+description+unit is idempotent in the OTel SDK — but calling
// them repeatedly is wasteful and triggers duplicate-registration warnings in
// some exporters. Eagerly instantiate once here.
const meter = metrics.getMeter(METER_NAME);

export const LoanPlatformMetrics = {
  // Loan request metrics
  loanRequestsTotal: meter.createCounter('loan_requests_total', {
    description: 'Total number of loan requests submitted',
  }),
  loanRequestDuration: meter.createHistogram('loan_request_duration_ms', {
    description: 'Duration of loan request processing in milliseconds',
    unit: 'ms',
  }),

  // Workflow metrics
  workflowsStarted: meter.createCounter('workflow_started_total', {
    description: 'Total workflows started',
  }),
  workflowsCompleted: meter.createCounter('workflow_completed_total', {
    description: 'Total workflows completed',
  }),
  workflowDuration: meter.createHistogram('workflow_duration_ms', {
    description: 'Workflow execution duration in milliseconds',
    unit: 'ms',
  }),

  // AI metrics
  aiDecisionsTotal: meter.createCounter('ai_decisions_total', {
    description: 'Total AI decisions made',
  }),
  aiDecisionLatency: meter.createHistogram('ai_decision_latency_ms', {
    description: 'AI decision latency in milliseconds',
    unit: 'ms',
  }),
  aiRiskScoreHistogram: meter.createHistogram('ai_risk_score', {
    description: 'Distribution of AI risk scores',
  }),
  aiConfidenceHistogram: meter.createHistogram('ai_confidence_score', {
    description: 'Distribution of AI confidence scores — alerts when mean drops below 0.7',
  }),
  aiTokensUsed: meter.createCounter('ai_tokens_used_total', {
    description: 'Total LLM tokens consumed across all decisions',
  }),

  // Policy metrics
  policyEvaluationsTotal: meter.createCounter('policy_evaluations_total', {
    description: 'Total policy evaluations',
  }),
  policyViolationsTotal: meter.createCounter('policy_violations_total', {
    description: 'Total policy violations detected',
  }),
  policyEvalDuration: meter.createHistogram('policy_eval_duration_ms', {
    description: 'Policy evaluation duration in milliseconds',
    unit: 'ms',
  }),

  // Human approval metrics
  humanApprovalsRequested: meter.createCounter('human_approvals_requested_total', {
    description: 'Total human approvals requested',
  }),
  humanApprovalDuration: meter.createHistogram('human_approval_duration_ms', {
    description: 'Time waiting for human approval in milliseconds',
    unit: 'ms',
  }),

  // Kafka metrics
  kafkaMessagesPublished: meter.createCounter('kafka_messages_published_total', {
    description: 'Total Kafka messages published',
  }),
  kafkaMessagesConsumed: meter.createCounter('kafka_messages_consumed_total', {
    description: 'Total Kafka messages consumed',
  }),

  // Audit metrics
  auditRecordsCreated: meter.createCounter('audit_records_created_total', {
    description: 'Total audit records created',
  }),
};
