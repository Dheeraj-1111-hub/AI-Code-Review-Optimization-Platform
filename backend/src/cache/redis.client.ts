import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Persistent connection for caching (can reuse BullMQ's connection if desired, but good to isolate)
export const cacheClient = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export class CacheService {
  static async get(key: string): Promise<any | null> {
    try {
      const data = await cacheClient.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await cacheClient.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await cacheClient.del(key);
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
    }
  }
}
