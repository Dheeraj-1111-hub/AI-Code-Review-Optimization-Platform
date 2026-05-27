import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// We need separate connections for publishing and subscribing in Redis
export const pubClient = new IORedis(redisUrl);
export const subClient = new IORedis(redisUrl);

export class PubSubManager {
  static async publishEvent(channel: string, eventName: string, payload: any) {
    const message = JSON.stringify({ eventName, payload });
    await pubClient.publish(channel, message);
  }

  static subscribeToChannel(channel: string, callback: (eventName: string, payload: any) => void) {
    subClient.subscribe(channel, (err) => {
      if (err) console.error(`Failed to subscribe to ${channel}:`, err);
    });

    subClient.on('message', (chan, message) => {
      if (chan === channel) {
        try {
          const { eventName, payload } = JSON.parse(message);
          callback(eventName, payload);
        } catch (error) {
          console.error(`PubSub Parsing Error on channel ${chan}:`, error);
        }
      }
    });
  }
}
