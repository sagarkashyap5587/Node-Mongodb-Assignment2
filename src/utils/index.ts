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
