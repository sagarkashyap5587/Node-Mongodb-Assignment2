// import { RedisConnection } from "../../providers/redis/redis.js";
import { redisConnection } from "../../providers/redis/redis.js";
import { AUTH_CONSTANTS, REDIS_KEYS } from "../../constant/constant.js";
import type { UserProfile } from "./user.interface.js";

class UserCache {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const raw = await redisConnection.get(REDIS_KEYS.profile(userId));
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch (err) {
      console.error("Redis profile read failed", err);
      return null;
    }
  }

  async setProfile(userId: string, profile: UserProfile) {
    await redisConnection.set(
      REDIS_KEYS.profile(userId),
      JSON.stringify(profile),
    );
  }

  async deleteProfile(userId: string) {
    await redisConnection.del(REDIS_KEYS.profile(userId));
  }
}

export const userCache = new UserCache();
