export const config = {
  server: {
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    host: process.env['HOST'] ?? '0.0.0.0',
    trustProxy: process.env['TRUST_PROXY'] === 'true',
  },
  jwt: {
    secret: process.env['JWT_SECRET'] ?? 'change-me-super-secret-jwt-key-min-32-chars',
    expiry: process.env['JWT_EXPIRY'] ?? '24h',
  },
  rateLimit: {
    max: parseInt(process.env['API_RATE_LIMIT_MAX'] ?? '100', 10),
    timeWindow: parseInt(process.env['API_RATE_LIMIT_WINDOW'] ?? '60000', 10),
  },
  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },
  temporal: {
    address: process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233',
    namespace: process.env['TEMPORAL_NAMESPACE'] ?? 'loan-governance',
    taskQueue: process.env['TEMPORAL_TASK_QUEUE'] ?? 'loan-approval',
  },
  services: {
    workflow: process.env['WORKFLOW_SERVICE_URL'] ?? 'http://localhost:3001',
    policy: process.env['POLICY_SERVICE_URL'] ?? 'http://localhost:3002',
    ai: process.env['AI_SERVICE_URL'] ?? 'http://localhost:3003',
    audit: process.env['AUDIT_SERVICE_URL'] ?? 'http://localhost:3004',
  },
  otel: {
    serviceName: process.env['OTEL_SERVICE_NAME'] ?? 'api-gateway',
    endpoint: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4318',
  },
  kafka: {
    brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
  },
};
