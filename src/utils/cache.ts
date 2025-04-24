import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

export const clearCache = async (keyPattern: string) => {
  try {
    const keys = await redisClient.keys(keyPattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Cache clearing error:", error);
  }
};

export const getCache = async (key: string) => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

export const setCache = async (key: string, value: string, ttl?: number) => {
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error("Cache set error:", error);
  }
};
