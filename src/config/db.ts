import mongoose from "mongoose";
import { ConfigurationFactory } from "../constant/config.js";

export class MongoConnection {
  private MONG_DB_URL: string;
  constructor() {
    this.MONG_DB_URL =
      ConfigurationFactory.get("MONGO_DB_URL") +
      "/" +
      ConfigurationFactory.get("MONGO_DATABASE_NAME");
  }

  public async initConnection() {
    await mongoose.connect(this.MONG_DB_URL);
    mongoose.set({ debug: true });
    console.log("MongoDB connected successfully");
  }
}
