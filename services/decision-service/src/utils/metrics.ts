import { createHistogram, createCounter } from '@loan-platform/telemetry';

export const decisionLatencyHistogram = createHistogram('decision-service', 'decision_pipeline_duration_ms', { description: 'End-to-end decision pipeline latency in ms', unit: 'ms' });
export const retrievalLatencyHistogram = createHistogram('decision-service', 'decision_retrieval_duration_ms', { description: 'RAG retrieval latency in ms', unit: 'ms' });
export const policyLatencyHistogram = createHistogram('decision-service', 'decision_policy_duration_ms', { description: 'OPA policy evaluation latency in ms', unit: 'ms' });
export const aiInferenceLatencyHistogram = createHistogram('decision-service', 'decision_ai_inference_duration_ms', { description: 'AI inference latency in ms', unit: 'ms' });
export const decisionOutcomeCounter = createCounter('decision-service', 'decision_outcomes_total', { description: 'Total decisions by outcome' });
export const escalationCounter = createCounter('decision-service', 'decision_escalations_total', { description: 'Total escalations by reason' });
export const confidenceHistogram = createHistogram('decision-service', 'decision_confidence_score', { description: 'Confidence score distribution' });
export const riskScoreHistogram = createHistogram('decision-service', 'decision_risk_score', { description: 'Risk score distribution' });
