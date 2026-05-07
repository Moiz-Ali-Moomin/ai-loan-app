import { metrics } from '@opentelemetry/api';

const METER_NAME = 'loan-platform';

export const LoanPlatformMetrics = {
  // Loan request metrics
  loanRequestsTotal: () => metrics.getMeter(METER_NAME).createCounter('loan_requests_total', {
    description: 'Total number of loan requests submitted',
  }),
  loanRequestDuration: () => metrics.getMeter(METER_NAME).createHistogram('loan_request_duration_ms', {
    description: 'Duration of loan request processing in milliseconds',
    unit: 'ms',
  }),

  // Workflow metrics
  workflowsStarted: () => metrics.getMeter(METER_NAME).createCounter('workflow_started_total', {
    description: 'Total workflows started',
  }),
  workflowsCompleted: () => metrics.getMeter(METER_NAME).createCounter('workflow_completed_total', {
    description: 'Total workflows completed',
  }),
  workflowDuration: () => metrics.getMeter(METER_NAME).createHistogram('workflow_duration_ms', {
    description: 'Workflow execution duration in milliseconds',
    unit: 'ms',
  }),

  // AI metrics
  aiDecisionsTotal: () => metrics.getMeter(METER_NAME).createCounter('ai_decisions_total', {
    description: 'Total AI decisions made',
  }),
  aiDecisionLatency: () => metrics.getMeter(METER_NAME).createHistogram('ai_decision_latency_ms', {
    description: 'AI decision latency in milliseconds',
    unit: 'ms',
  }),
  aiRiskScoreHistogram: () => metrics.getMeter(METER_NAME).createHistogram('ai_risk_score', {
    description: 'Distribution of AI risk scores',
  }),

  // Policy metrics
  policyEvaluationsTotal: () => metrics.getMeter(METER_NAME).createCounter('policy_evaluations_total', {
    description: 'Total policy evaluations',
  }),
  policyViolationsTotal: () => metrics.getMeter(METER_NAME).createCounter('policy_violations_total', {
    description: 'Total policy violations detected',
  }),
  policyEvalDuration: () => metrics.getMeter(METER_NAME).createHistogram('policy_eval_duration_ms', {
    description: 'Policy evaluation duration in milliseconds',
    unit: 'ms',
  }),

  // Human approval metrics
  humanApprovalsRequested: () => metrics.getMeter(METER_NAME).createCounter('human_approvals_requested_total', {
    description: 'Total human approvals requested',
  }),
  humanApprovalDuration: () => metrics.getMeter(METER_NAME).createHistogram('human_approval_duration_ms', {
    description: 'Time waiting for human approval in milliseconds',
    unit: 'ms',
  }),

  // Kafka metrics
  kafkaMessagesPublished: () => metrics.getMeter(METER_NAME).createCounter('kafka_messages_published_total', {
    description: 'Total Kafka messages published',
  }),
  kafkaMessagesConsumed: () => metrics.getMeter(METER_NAME).createCounter('kafka_messages_consumed_total', {
    description: 'Total Kafka messages consumed',
  }),

  // Audit metrics
  auditRecordsCreated: () => metrics.getMeter(METER_NAME).createCounter('audit_records_created_total', {
    description: 'Total audit records created',
  }),
};
