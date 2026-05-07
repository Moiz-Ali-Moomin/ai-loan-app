export { initTelemetry } from './init';
export { getTelemetryConfig } from './config';
export { createSpan, withSpan, getActiveSpan, injectTraceHeaders, extractTraceContext } from './tracing';
export { recordMetric, createCounter, createHistogram, createGauge } from './metrics';
export { LoanPlatformMetrics } from './metrics-registry';
export type { TelemetryConfig, SpanOptions } from './types';
