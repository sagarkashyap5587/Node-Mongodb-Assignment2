import { ApiError } from "../errors/apiError.js";
import { POST_CONSTANTS } from "../constant/constant.js";
export class Utils {
  getOffsetAndLimit(
    page: number,
    limit: number,
  ): { offset: number; limit: number } {
    const offset = (page - 1) * limit;
    return { offset, limit };
  }

  paginateResponseData<T>(data: T[], totalCount: number) {
    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / data.length),
      nextPageNumber:
        data.length > 0 ? Math.ceil(totalCount / data.length) + 1 : null,
      currentPageNumber:
        data.length > 0 ? Math.ceil(totalCount / data.length) : null,
      isNextPageAvailable:
        data.length > 0
          ? Math.ceil(totalCount / data.length) + 1 <=
            Math.ceil(totalCount / data.length)
          : false,
    };
  }
}
export const utils = new Utils();

export function assertObjectId(id: string, label = "id") {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

const asString = (v: unknown) => (typeof v === "string" ? v : "");

export function parsePagination(raw: Record<string, unknown>) {
  let page = Number.parseInt(asString(raw.page), 10);
  if (!Number.isFinite(page) || page < 1) page = POST_CONSTANTS.DEFAULT_PAGE;

  let limit = Number.parseInt(asString(raw.limit), 10);
  if (!Number.isFinite(limit) || limit < 1)
    limit = POST_CONSTANTS.DEFAULT_LIMIT;
  limit = Math.min(limit, POST_CONSTANTS.MAX_LIMIT);

  return { page, limit };
}


export type CacheStatus = "HIT" | "MISS";
 
// Services return this; controllers turn "cache" into the X-Cache header.
export interface CacheResult<T> {
  data: T;
  cache: CacheStatus;
}