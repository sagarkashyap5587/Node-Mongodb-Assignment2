import type { Request, Response } from "express";
import { statsService } from "./stats.service.js";

class StatsApi {
  async getStats(_req: Request, res: Response) {
    const { data, cache } = await statsService.getStats();
    res.set("X-Cache", cache);
    res.json({ success: true, data });
  }
}

export const statsApi = new StatsApi();