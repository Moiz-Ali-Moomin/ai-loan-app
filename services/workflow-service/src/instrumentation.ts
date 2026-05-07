import { initTelemetry, getTelemetryConfig } from '@loan-platform/telemetry';
initTelemetry(getTelemetryConfig(process.env['OTEL_SERVICE_NAME'] ?? 'workflow-service'));
