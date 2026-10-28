// import { RedisConnection } from "../../providers/redis/redis.js";
import { redisConnection } from "../../providers/redis/redis.js";
import { AUTH_CONSTANTS, REDIS_KEYS } from "../../constant/constant.js";

class AuthCache {
  async getFailCount(email: string): Promise<number> {
    const value = await redisConnection.get(REDIS_KEYS.loginFail(email));
    return value ? Number(value) : 0;
  }

  async getTtl(email: string): Promise<number> {
    return redisConnection.ttl(REDIS_KEYS.loginFail(email));
  }

  async increaseFail(email: string) {
    const key = REDIS_KEYS.loginFail(email);
    const count = await redisConnection.incr(key);
    if (count === 1) {
      await redisConnection.expire(
        key,
        AUTH_CONSTANTS.LOGIN_FAIL_WINDOW_SECONDS,
      );
    }
    return count;
  }

  async clearFail(email: string) {
    await redisConnection.del(REDIS_KEYS.loginFail(email));
  }
}

export const authCache = new AuthCache();
