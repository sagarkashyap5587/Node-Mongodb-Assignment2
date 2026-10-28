import { testingRepository } from "./testing.repository.js";

class TestingService {
  async getTestingData() {
    const data: any = await testingRepository.getTheaterData();
    return data;
  }
}

export const testingService = new TestingService();
