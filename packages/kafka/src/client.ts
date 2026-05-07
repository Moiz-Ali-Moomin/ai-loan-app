import { Kafka, type KafkaConfig, logLevel } from 'kafkajs';

export function createKafkaClient(clientId: string, overrides?: Partial<KafkaConfig>): Kafka {
  const brokers = (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(',');

  return new Kafka({
    clientId,
    brokers,
    logLevel: logLevel.WARN,
    retry: {
      initialRetryTime: 300,
      retries: 10,
      maxRetryTime: 30000,
      factor: 0.2,
    },
    connectionTimeout: 10000,
    requestTimeout: 30000,
    ...overrides,
  });
}
