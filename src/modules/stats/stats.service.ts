import { randomUUID } from "node:crypto";
import { statsRepository } from "./stats.repository.js";
import { statsCache } from "./stats.cache.js";
import { STATS_CONSTANTS } from "../../constant/constant.js";
import type{ CacheResult } from "../../utils/index.js";

import type { StatsData } from "./stats.interface.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class StatsService {
  // Requests that arrive at the same moment in this process share ONE promise
  private inflight: Promise<CacheResult<StatsData>> | null = null;

  getStats(): Promise<CacheResult<StatsData>> {
    if (!this.inflight) {
      this.inflight = this.load().finally(() => {
        this.inflight = null;
      });
    }
    return this.inflight;
  }

  private async load(): Promise<CacheResult<StatsData>> {
    const cached = await statsCache.get();
    if (cached) return { data: cached, cache: "HIT" };

    // Cache miss: only ONE request (across all server instances) may run the aggregation
    const token = randomUUID();
    const lock = await statsCache.acquireLock(token);

    if (lock === false) {
      // someone else is computing: wait for the cache to be filled
      for (let i = 0; i < STATS_CONSTANTS.WAIT_MAX_STEPS; i++) {
        await sleep(STATS_CONSTANTS.WAIT_STEP_MS);
        const filled = await statsCache.get();
        if (filled) return { data: filled, cache: "HIT" };
      }
      // lock holder died or is too slow -> compute ourselves (API must keep working)
    }

    try {
      if (lock === true) {
        // double-check: the cache may have been filled while we were getting the lock
        const again = await statsCache.get();
        if (again) return { data: again, cache: "HIT" };
      }
      const data = await statsRepository.getStats(); // MongoDB
      await statsCache.set(data);
      return { data, cache: "MISS" };
    } finally {
      if (lock === true) await statsCache.releaseLock(token);
    }
  }
}

export const statsService = new StatsService();