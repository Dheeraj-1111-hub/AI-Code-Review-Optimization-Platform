import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

// Setup Queues
export const repoSyncQueue = new Queue('repo-sync-queue', { connection });
export const reviewQueue = new Queue('review-queue', { connection });
export const webhookQueue = new Queue('webhook-queue', { connection });

export const initQueues = async () => {
  console.log('BullMQ Queues initialized via Redis.');
};
