import { createHistogram, createCounter } from '@loan-platform/telemetry';

// Existing pipeline metrics (kept for backwards compat)
export { decisionLatencyHistogram, decisionOutcomeCounter, escalationCounter, confidenceHistogram, riskScoreHistogram } from './metrics.js';

// Graph engine metrics
export const graphExecutionsTotal = createCounter(
  'decision-service',
  'graph_executions_total',
  { description: 'Total graph executions by tenant, decision, flow' },
);

export const graphExecutionDuration = createHistogram(
  'decision-service',
  'graph_execution_duration_ms',
  { description: 'End-to-end graph execution duration in ms', unit: 'ms' },
);

export const graphNodeExecutionDuration = createHistogram(
  'decision-service',
  'graph_node_execution_duration_ms',
  { description: 'Per-node execution duration in ms', unit: 'ms' },
);

export const approvalGatesTotal = createCounter(
  'decision-service',
  'approval_gates_total',
  { description: 'Total approval gate encounters by tenant and node type' },
);

export const approvalDecisionsTotal = createCounter(
  'decision-service',
  'approval_decisions_total',
  { description: 'Total approval decisions by outcome' },
);

export const approvalWaitDuration = createHistogram(
  'decision-service',
  'approval_wait_duration_ms',
  { description: 'Time waiting for human approval in ms', unit: 'ms' },
);

export const flowPublishTotal = createCounter(
  'decision-service',
  'flow_publish_total',
  { description: 'Total flow publish events' },
);

export const cacheHitsTotal = createCounter(
  'decision-service',
  'cache_hits_total',
  { description: 'Redis cache hits by cache key type' },
);

export const cacheMissesTotal = createCounter(
  'decision-service',
  'cache_misses_total',
  { description: 'Redis cache misses by cache key type' },
);
