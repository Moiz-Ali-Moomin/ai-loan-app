import { initTelemetry, getTelemetryConfig } from '@loan-platform/telemetry';

// Must be the first import — initializes OTel before anything else
initTelemetry(getTelemetryConfig(process.env['OTEL_SERVICE_NAME'] ?? 'api-gateway'));
