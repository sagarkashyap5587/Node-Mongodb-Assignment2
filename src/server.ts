
import express, { type Express } from "express";
import { ConfigurationFactory } from "./constant/config.js";
import { MongoConnection } from "./config/db.js";
//import { RedisConnection } from "./providers/redis/redis.js";
import { redisConnection } from "./providers/redis/redis.js";
import { userRoutes } from "./routes/index.js";

class Server {
  private port: number;
  private app: Express = express();
  private mongoConnection = new MongoConnection();
  private redisConnection = redisConnection;

  constructor() {
    this.port = Number(ConfigurationFactory.get("PORT"));
    this.app.use(express.json());
    this.app.use("/users", userRoutes);
  }

  async startServer(): Promise<void> {
    try {
      await this.mongoConnection.initConnection();
      await this.redisConnection.initConnection();
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.startServer();
