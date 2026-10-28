import { redisConnection } from "../../providers/redis/redis.js";
import { POST_CONSTANTS, REDIS_KEYS } from "../../constant/constant.js";
import type{ PostListResult, PostView } from "./post.interface.js";

class PostCache {
  // ---------- single post: post:<id> ----------
  async getPost(id: string): Promise<PostView | null> {
    try {
      const raw = await redisConnection.get(REDIS_KEYS.post(id));
      return raw ? (JSON.parse(raw) as PostView) : null;
    } catch (err) {
      console.error("Redis post read failed", err);
      return null;
    }
  }

  async setPost(id: string, post: PostView) {
    try {
      await redisConnection.set(REDIS_KEYS.post(id), JSON.stringify(post));
    } catch (err) {
      console.error("Redis post write failed", err);
    }
  }

  // ---------- list: posts:list:v<version>:... ----------
  async getListVersion(): Promise<string> {
    try {
      return (await redisConnection.get(REDIS_KEYS.postListVersion)) ?? "0";
    } catch (err) {
      console.error("Redis list version read failed", err);
      return "0";
    }
  }

  async getList(key: string): Promise<PostListResult | null> {
    try {
      const raw = await redisConnection.get(key);
      return raw ? (JSON.parse(raw) as PostListResult) : null;
    } catch (err) {
      console.error("Redis list read failed", err);
      return null;
    }
  }

  async setList(key: string, value: PostListResult) {
    try {
      await redisConnection.set(key, JSON.stringify(value));
    } catch (err) {
      console.error("Redis list write failed", err);
    }
  }

  // ---------- invalidation ----------
  // Any post created -> every old list key is ignored
  async invalidateLists() {
    try {
      await redisConnection.incr(REDIS_KEYS.postListVersion);
    } catch (err) {
      console.error("Redis list invalidation failed", err);
    }
  }

  // Post updated / deleted / commentCount changed (Part 4 comments call this too)
  async invalidatePost(id: string) {
    try {
      await redisConnection.multi().del(REDIS_KEYS.post(id)).incr(REDIS_KEYS.postListVersion).exec();
    } catch (err) {
      console.error("Redis post invalidation failed", err);
    }
  }
}

export const postCache = new PostCache();