import { redisConnection } from "../../providers/redis/redis.js";
import { REDIS_KEYS, STATS_CONSTANTS } from "../../constant/constant.js"
import type { StatsData } from "./stats.interface.js";


const RELEASE_LOCK = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

class StatsCache {
  async get(): Promise<StatsData | null> {
    try {
      const raw = await redisConnection.get(REDIS_KEYS.stats);
      return raw ? (JSON.parse(raw) as StatsData) : null;
    } catch (err) {
      console.error("Redis stats read failed, falling back to MongoDB:", err);
      return null;
    }
  }

  async set(data: StatsData) {
    try {
      await redisConnection.set(REDIS_KEYS.stats, JSON.stringify(data));
    } catch (err) {
      console.error("Redis stats write failed:", err);
    }
  }

  // true = we got the lock, false = someone else is computing, null = Redis problem
  async acquireLock(token: string): Promise<boolean | null> {
    try {
      const ok = await redisConnection.set(REDIS_KEYS.statsLock, token);
      return ok === "OK";
    } catch (err) {
      console.error("Redis stats lock failed:", err);
      return null;
    }
  }

  async releaseLock(token: string) {
    try {
      await redisConnection.eval(RELEASE_LOCK, { keys: [REDIS_KEYS.statsLock], arguments: [token] });
    } catch (err) {
      console.error("Redis stats unlock failed (lock expires by itself):", err);
    }
  }

  
}

export const statsCache = new StatsCache();