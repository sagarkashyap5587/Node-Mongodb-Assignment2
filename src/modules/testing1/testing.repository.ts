import { TheaterModel } from "./testing.schema.js";
import type { TheaterSchema } from "./testing.interface.js";

class TestingRepository {
  async getTheaterData() {
    const data: TheaterSchema | null = await TheaterModel.findOne();
    return data;
  }
}

export const testingRepository = new TestingRepository();
