import { type Producer, type Kafka, CompressionTypes } from 'kafkajs';
import { randomUUID } from 'crypto';
import type { KafkaEventEnvelope, KafkaTopic } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';
import { trace } from '@opentelemetry/api';

const logger = createLogger('kafka-producer');

export class KafkaProducerClient {
  private producer: Producer;
  private connected = false;

  constructor(kafka: Kafka) {
    this.producer = kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true,
      maxInFlightRequests: 5,
      transactionTimeout: 30000,
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.producer.connect();
    this.connected = true;
    logger.info('Kafka producer connected');
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.producer.disconnect();
    this.connected = false;
  }

  async publish<T>(
    topic: KafkaTopic,
    eventType: string,
    payload: T,
    options: {
      tenantId: string;
      correlationId: string;
      source: string;
      key?: string;
    }
  ): Promise<void> {
    const span = trace.getActiveSpan();
    const traceId = span?.spanContext().traceId ?? randomUUID();

    const envelope: KafkaEventEnvelope<T> = {
      id: randomUUID(),
      topic,
      eventType,
      version: '1.0',
      source: options.source,
      tenantId: options.tenantId,
      correlationId: options.correlationId,
      traceId,
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: options.key ?? randomUUID(),
          value: JSON.stringify(envelope),
          headers: {
            'content-type': 'application/json',
            'trace-id': traceId,
            'correlation-id': options.correlationId,
            'event-type': eventType,
            'tenant-id': options.tenantId,
          },
        },
      ],
    });

    logger.debug(`Published event to ${topic}`, {
      topic,
      eventType,
      correlationId: options.correlationId,
      traceId,
    });
  }
}
