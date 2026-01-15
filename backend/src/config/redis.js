import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;

export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.warn('REDIS_URL not set - using in-memory rate limiting');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error({ message: 'Redis Client Error', error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error({ message: 'Failed to connect to Redis', error: error.message });
    return null;
  }
};

export const getRedisClient = () => redisClient;

// Clear rate limit for a specific key (IP or user)
export const clearRateLimit = async (key) => {
  if (!redisClient) return false;
  
  try {
    // Rate limit keys typically follow pattern: rl:IP or rl:auth:IP
    const keys = await redisClient.keys(`rl:*${key}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info({ message: 'Rate limit cleared', key, keysDeleted: keys.length });
      return true;
    }
    return false;
  } catch (error) {
    logger.error({ message: 'Failed to clear rate limit', error: error.message });
    return false;
  }
};

// Clear all rate limits (use with caution)
export const clearAllRateLimits = async () => {
  if (!redisClient) return false;
  
  try {
    const keys = await redisClient.keys('rl:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info({ message: 'All rate limits cleared', keysDeleted: keys.length });
      return true;
    }
    return false;
  } catch (error) {
    logger.error({ message: 'Failed to clear all rate limits', error: error.message });
    return false;
  }
};

export default { connectRedis, getRedisClient, clearRateLimit, clearAllRateLimits };
