import { ApiError } from "../errors/apiError.js";
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