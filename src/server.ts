import express, { type Express } from "express";
import { ConfigurationFactory } from "./constant/config.js"; 
import { MongoConnection } from "./config/db.js";
import { userRoutes } from "./routes/index.js";

class Server {
  private port!: number;
  private app: Express = express();

  constructor() {
    this.initializeVariables();
    this.initializeRoutes();
    this.startServer();
  }

  initializeVariables() {
    this.port = Number(ConfigurationFactory.get("PORT"));
    this.app.use(express.json());
    new MongoConnection().initConnection();
  }

  initializeRoutes() {
    this.app.use("/users", userRoutes);
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}
(() => {
  new Server();
})();
