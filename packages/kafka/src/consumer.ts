import { type Consumer, type Producer, type Kafka, type EachMessagePayload } from 'kafkajs';
import type { KafkaEventEnvelope } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('kafka-consumer');

// Messages that have failed this many times are dropped rather than re-DLQ'd
// to prevent infinite routing loops if a DLQ consumer re-publishes.
const MAX_DLQ_RETRIES = parseInt(process.env['KAFKA_DLQ_MAX_RETRIES'] ?? '3', 10);

type MessageHandler<T = unknown> = (
  envelope: KafkaEventEnvelope<T>,
  raw: EachMessagePayload
) => Promise<void>;

interface DlqRecord {
  originalTopic: string;
  originalPartition: number;
  originalOffset: string;
  originalTimestamp: string;
  originalPayload: string;
  originalHeaders: Record<string, string>;
  traceId: string;
  correlationId: string;
  error: { name: string; message: string; stack?: string };
  retryCount: number;
  failedAt: string;
}

export class KafkaConsumerClient {
  private consumer: Consumer;
  private dlqProducer: Producer;
  private handlers = new Map<string, MessageHandler>();

  constructor(kafka: Kafka, groupId: string) {
    this.consumer = kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576,
      retry: { retries: 5 },
    });

    // Separate producer for DLQ — auto topic creation enabled because DLQ
    // topics are derived at runtime and may not be pre-provisioned.
    this.dlqProducer = kafka.producer({
      allowAutoTopicCreation: true,
      idempotent: false,
    });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    try {
      await this.dlqProducer.connect();
      logger.info('Kafka consumer and DLQ producer connected');
    } catch (err) {
      // DLQ producer failure must not prevent the consumer from starting.
      logger.error('DLQ producer failed to connect — DLQ routing unavailable', { err });
    }
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    try {
      await this.dlqProducer.disconnect();
    } catch {
      // best-effort
    }
  }

  registerHandler<T>(eventType: string, handler: MessageHandler<T>): void {
    this.handlers.set(eventType, handler as MessageHandler);
  }

  async subscribe(topics: string[]): Promise<void> {
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }
  }

  async startConsuming(): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload) => {
        const { topic, partition, message } = payload;
        if (!message.value) return;

        const headerStr = (v: Buffer | string | null | undefined): string =>
          v == null ? '' : Buffer.isBuffer(v) ? v.toString() : String(v);

        const retryCount = message.headers?.['x-retry-count']
          ? parseInt(headerStr(message.headers['x-retry-count'] as Buffer | string | null), 10)
          : 0;

        try {
          const envelope = JSON.parse(message.value.toString()) as KafkaEventEnvelope;
          const handler = this.handlers.get(envelope.eventType);

          if (handler) {
            await handler(envelope, payload);
          } else {
            logger.debug(`No handler for event type: ${envelope.eventType}`, {
              topic,
              eventType: envelope.eventType,
            });
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));

          logger.error('Failed to process Kafka message', {
            topic,
            partition,
            offset: message.offset,
            retryCount,
            error: error.message,
          });

          if (retryCount >= MAX_DLQ_RETRIES) {
            logger.error('Message exceeded max DLQ retries, dropping to prevent loop', {
              topic,
              offset: message.offset,
              retryCount,
            });
            return;
          }

          await this.publishToDlq(topic, partition, message, error, retryCount + 1);
        }
      },
    });
  }

  private async publishToDlq(
    originalTopic: string,
    partition: number,
    message: EachMessagePayload['message'],
    error: Error,
    retryCount: number
  ): Promise<void> {
    const dlqTopic = `${originalTopic}.dlq`;

    const headerStr = (v: Buffer | string | null | undefined): string =>
      v == null ? '' : Buffer.isBuffer(v) ? v.toString() : String(v);

    const originalHeaders: Record<string, string> = {};
    if (message.headers) {
      for (const [k, v] of Object.entries(message.headers)) {
        originalHeaders[k] = headerStr(v as Buffer | string | null);
      }
    }

    const traceId = originalHeaders['trace-id'] ?? '';
    const correlationId = originalHeaders['correlation-id'] ?? '';

    const dlqRecord: DlqRecord = {
      originalTopic,
      originalPartition: partition,
      originalOffset: message.offset,
      originalTimestamp: message.timestamp,
      originalPayload: message.value?.toString() ?? '',
      originalHeaders,
      traceId,
      correlationId,
      ...(error.stack !== undefined
        ? { error: { name: error.name, message: error.message, stack: error.stack } }
        : { error: { name: error.name, message: error.message } }),
      retryCount,
      failedAt: new Date().toISOString(),
    };

    try {
      await this.dlqProducer.send({
        topic: dlqTopic,
        messages: [
          {
            key: message.key ?? null,
            value: JSON.stringify(dlqRecord),
            headers: {
              'content-type': 'application/json',
              'x-original-topic': originalTopic,
              'x-retry-count': String(retryCount),
              'trace-id': traceId,
              'correlation-id': correlationId,
              // Truncated to stay within Kafka header size limits
              'x-error': error.message.slice(0, 200),
            },
          },
        ],
      });

      logger.warn('Message routed to DLQ', {
        dlqTopic,
        originalTopic,
        partition,
        offset: message.offset,
        retryCount,
        traceId,
        correlationId,
        error: error.message,
      });
    } catch (dlqErr) {
      // Do not rethrow — a DLQ publish failure must not crash the consumer.
      logger.error('Failed to publish to DLQ', {
        dlqTopic,
        originalTopic,
        offset: message.offset,
        dlqErr,
      });
    }
  }
}
