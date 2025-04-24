var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from "redis";
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
// Connect to Redis
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.connect();
}))();
export const clearCache = (keyPattern) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keys = yield redisClient.keys(keyPattern);
        if (keys.length > 0) {
            yield redisClient.del(keys);
        }
    }
    catch (error) {
        console.error("Cache clearing error:", error);
    }
});
export const getCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield redisClient.get(key);
    }
    catch (error) {
        console.error("Cache get error:", error);
        return null;
    }
});
export const setCache = (key, value, ttl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ttl) {
            yield redisClient.setEx(key, ttl, value);
        }
        else {
            yield redisClient.set(key, value);
        }
    }
    catch (error) {
        console.error("Cache set error:", error);
    }
});
