import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function publishToRedis(channel: string, payload: object) {
  try {
    await redis.publish(channel, JSON.stringify(payload));
  } catch (error) {
    console.error('Redis publish error:', error);
  }
}
