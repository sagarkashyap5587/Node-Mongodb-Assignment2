
import { redisConnection } from "../../providers/redis/redis.js";
import { REDIS_KEYS } from "../../constant/constant.js";

class SessionCache {
  private secondsLeft(expiresAt: Date) {
    return Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  }

  async save(token: string, userId: string, expiresAt: Date) {
    const ttl = this.secondsLeft(expiresAt);
    if (ttl <= 0) return;
    await redisConnection
      .multi()
      .set(REDIS_KEYS.session(token), userId, { EX: ttl })
      .sAdd(REDIS_KEYS.userSessions(userId), token)
      .exec();
  }

  async getUserId(token: string): Promise<string | null> {
    try {
      return await redisConnection.get(REDIS_KEYS.session(token));
    } catch (err) {
      console.error("Redis get failed, falling back to MongoDB", err);
      return null;
    }
  }

  async remove(token: string, userId: string) {
    await redisConnection
      .multi()
      .del(REDIS_KEYS.session(token))
      .sRem(REDIS_KEYS.userSessions(userId), token)
      .exec();
  }
}

export const sessionCache = new SessionCache();