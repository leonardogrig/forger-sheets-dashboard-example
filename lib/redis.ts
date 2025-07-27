import { Redis } from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  return redis;
}

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = getRedis();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}

export const cacheService = new CacheService();