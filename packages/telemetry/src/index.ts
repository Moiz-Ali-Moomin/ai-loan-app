export { initTelemetry } from './init.js';
export { getTelemetryConfig } from './config.js';
export { createSpan, withSpan, getActiveSpan, injectTraceHeaders, extractTraceContext } from './tracing.js';
export { recordMetric, createCounter, createHistogram, createGauge } from './metrics.js';
export { LoanPlatformMetrics } from './metrics-registry.js';
export type { TelemetryConfig, SpanOptions } from './types.js';
