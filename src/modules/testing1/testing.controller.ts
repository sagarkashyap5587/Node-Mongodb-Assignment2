import { type Request, type Response } from "express";
import { testingService } from "./testing.service.js";

class TestingApi {
  async getTheatreData(req: Request, res: Response) {
    const data = await testingService.getTestingData();
    res.send(data);
  }
}

export const testingApi = new TestingApi();
