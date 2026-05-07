export interface TelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  otlpEndpoint: string;
  enableTracing: boolean;
  enableMetrics: boolean;
  enableLogs: boolean;
}

export interface SpanOptions {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  parentContext?: unknown;
}
