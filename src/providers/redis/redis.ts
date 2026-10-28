import { createClient, type RedisClientType } from "redis";
import { ConfigurationFactory } from "../../constant/config.js";

class RedisConnection {
  private client: RedisClientType;

  constructor() {
    const redisUrl =
      ConfigurationFactory.get("REDIS_URL") || "redis://localhost:6379";

    this.client = createClient({ url: redisUrl });

    this.client.on("error", (error) => {
      console.error("Redis Client Error:", error);
    });

    this.client.on("ready", () => {
      console.log("Redis connected successfully");
    });
  }

  async initConnection(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<string | null> {
    return this.client.set(key, value);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async expire(key: string, seconds: number): Promise<any> {
    return this.client.expire(key, seconds);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  multi() {
    return this.client.multi();
  }

  async closeConnection(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.close();
    }
  }
}

export const redisConnection = new RedisConnection();

// import { createClient, type RedisClientType } from "redis";
// import { ConfigurationFactory } from "../../constant/config.js";

// export class RedisConnection {
//   private client: RedisClientType;

//   constructor() {
//     const redisUrl =
//       ConfigurationFactory.get("REDIS_URL") || "redis://localhost:6379";

//     this.client = createClient({
//       url: redisUrl,
//     });

//     this.client.on("error", (error) => {
//       console.error("Redis Client Error:", error);
//     });

//     this.client.on("connect", () => {
//       console.log("Connecting to Redis...");
//     });

//     this.client.on("ready", () => {
//       console.log("Redis connected successfully");
//     });
//   }

//   async initConnection(): Promise<void> {
//     if (!this.client.isOpen) {
//       await this.client.connect();
//     }
//   }

//   getClient(): RedisClientType {
//     return this.client;
//   }

//   async closeConnection(): Promise<void> {
//     if (this.client.isOpen) {
//       await this.client.close();
//       console.log("Redis connection closed");
//     }
//   }
// }
