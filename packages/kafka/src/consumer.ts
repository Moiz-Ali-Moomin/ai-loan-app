import { type Consumer, type Kafka, type EachMessagePayload } from 'kafkajs';
import type { KafkaEventEnvelope } from '@loan-platform/shared-types';
import { createLogger } from '@loan-platform/logger';

const logger = createLogger('kafka-consumer');

type MessageHandler<T = unknown> = (
  envelope: KafkaEventEnvelope<T>,
  raw: EachMessagePayload
) => Promise<void>;

export class KafkaConsumerClient {
  private consumer: Consumer;
  private handlers = new Map<string, MessageHandler>();
  private running = false;

  constructor(kafka: Kafka, groupId: string) {
    this.consumer = kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576,
      retry: { retries: 5 },
    });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    logger.info('Kafka consumer connected');
  }

  async disconnect(): Promise<void> {
    this.running = false;
    await this.consumer.disconnect();
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
    this.running = true;
    await this.consumer.run({
      eachMessage: async (payload) => {
        const { topic, partition, message } = payload;
        if (!message.value) return;

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
          logger.error('Failed to process Kafka message', {
            topic,
            partition,
            offset: message.offset,
            err,
          });
        }
      },
    });
  }
}
