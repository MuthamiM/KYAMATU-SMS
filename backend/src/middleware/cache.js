import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

// In-memory fallback cache
const memoryCache = new Map();
const memoryCacheTimers = new Map();

export const getCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (redis && redis.isOpen) {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    logger.warn({ message: 'Redis getCache error, fallback to memory', error: err.message });
  }

  // Memory fallback
  return memoryCache.has(key) ? memoryCache.get(key) : null;
};

export const setCache = async (key, data, ttlSeconds = 60) => {
  try {
    const redis = getRedisClient();
    if (redis && redis.isOpen) {
      await redis.set(key, JSON.stringify(data), { EX: ttlSeconds });
      return;
    }
  } catch (err) {
    logger.warn({ message: 'Redis setCache error, fallback to memory', error: err.message });
  }

  // Memory fallback
  memoryCache.set(key, data);
  if (memoryCacheTimers.has(key)) {
    clearTimeout(memoryCacheTimers.get(key));
  }
  const timer = setTimeout(() => {
    memoryCache.delete(key);
    memoryCacheTimers.delete(key);
  }, ttlSeconds * 1000);
  memoryCacheTimers.set(key, timer);
};

export const clearCachePattern = async (pattern) => {
  try {
    const redis = getRedisClient();
    if (redis && redis.isOpen) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.info({ message: 'Cleared Redis cache keys', pattern, count: keys.length });
      }
    }
  } catch (err) {
    logger.warn({ message: 'Redis clearCachePattern error', error: err.message });
  }

  // Clear memory cache keys matching simple regex
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      if (memoryCacheTimers.has(key)) {
        clearTimeout(memoryCacheTimers.get(key));
        memoryCacheTimers.delete(key);
      }
    }
  }
};

/**
 * Express Middleware for caching GET responses
 * @param {number} ttlSeconds Time to live in seconds (default 60s)
 * @param {string} tag Cache group tag (e.g. 'dashboard', 'staff', 'academic')
 */
export const cacheRoute = (ttlSeconds = 60, tag = 'general') => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    // Cache key incorporates user id / role if authenticated, and full request URL
    const userId = req.user?.userId || 'anon';
    const cacheKey = `cache:${tag}:${userId}:${req.originalUrl || req.url}`;

    try {
      const cached = await getCache(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
    } catch (err) {
      logger.warn({ message: 'Cache middleware read error', error: err.message });
    }

    // Intercept res.json to store into cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttlSeconds).catch(() => {});
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

/**
 * Express Middleware to invalidate cache tags on mutating routes (POST/PUT/DELETE)
 * @param {string[]} tags List of tags to invalidate (e.g. ['staff', 'dashboard'])
 */
export const invalidateCache = (tags = []) => {
  return async (req, res, next) => {
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    const onComplete = () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const tag of tags) {
          clearCachePattern(`cache:${tag}:*`).catch(() => {});
        }
      }
    };

    res.json = (body) => {
      onComplete();
      return originalJson(body);
    };

    res.send = (body) => {
      onComplete();
      return originalSend(body);
    };

    next();
  };
};
