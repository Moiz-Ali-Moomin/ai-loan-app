import type { Kafka } from 'kafkajs';
import { KafkaTopic } from '@loan-platform/shared-types';

export const TOPICS = KafkaTopic;

export async function ensureTopicsExist(kafka: Kafka): Promise<void> {
  const admin = kafka.admin();
  await admin.connect();

  try {
    const existingTopics = await admin.listTopics();
    const topicsToCreate = Object.values(KafkaTopic).filter(
      (topic) => !existingTopics.includes(topic)
    );

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            { name: 'retention.ms', value: '604800000' },
            { name: 'min.insync.replicas', value: '1' },
          ],
        })),
        waitForLeaders: true,
      });
    }
  } finally {
    await admin.disconnect();
  }
}
