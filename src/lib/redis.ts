import Redis from 'ioredis';
import Logger from '@/utils/Logger';
import { IRedisClient } from "@/types/redis.types";

export class RedisClient implements IRedisClient {
  private static instance: RedisClient;
  private client: Redis;

  private constructor() {
    this.client = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
      reconnectOnError(err) {
        return err.message.includes('READONLY');
      },
    });

    this.client.on('error', (error) => {
      Logger.error(`[REDIS] Connection error: ${error}`);
    });

    this.client.on('connect', () => {
      Logger.success("[REDIS] Successfully connected to Redis");
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async set(key: string, value: any, expiresIn?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (expiresIn) {
      await this.client.setex(key, expiresIn, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async listPush(key: string, value: any): Promise<void> {
    await this.client.rpush(key, JSON.stringify(value));
  }

  async listGet<T>(key: string): Promise<T[]> {
    const list = await this.client.lrange(key, 0, -1);
    return list.map((item) => JSON.parse(item)) as T[];
  }

  async hashSet(key: string, field: string, value: any): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hashGet<T>(key: string, field: string): Promise<T | null> {
    const data = await this.client.hget(key, field);
    return data ? JSON.parse(data) as T : null;
  }

  async hashGetAll<T>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(key);
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(data)) {
      result[field] = JSON.parse(value) as T;
    }
    return result;
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async clearAll(): Promise<void> {
    await this.client.flushall();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// Export a singleton instance
export const redis = RedisClient.getInstance();
export default redis;