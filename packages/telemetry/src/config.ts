import type { TelemetryConfig } from './types.js';

export function getTelemetryConfig(serviceName: string): TelemetryConfig {
  return {
    serviceName,
    serviceVersion: process.env['SERVICE_VERSION'] ?? '1.0.0',
    environment: process.env['NODE_ENV'] ?? 'development',
    otlpEndpoint: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4318',
    enableTracing: process.env['OTEL_TRACES_EXPORTER'] !== 'none',
    enableMetrics: process.env['OTEL_METRICS_EXPORTER'] !== 'none',
    enableLogs: process.env['OTEL_LOGS_EXPORTER'] !== 'none',
  };
}
