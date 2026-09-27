/** Phân trang PageResponse {content, number, size, totalElements, totalPages} (contract §1). */

export const DEFAULT_PAGE_SIZE = 12;

/** Còn trang khi number + 1 < totalPages. */
const getNextPageParam = (last) => (last && last.number + 1 < last.totalPages ? last.number + 1 : undefined);

/** Gộp mọi trang của useInfiniteQuery thành một mảng. */
export const flattenPages = (data) => data?.pages?.flatMap((p) => p?.content ?? []) ?? [];

/** Tổng số phần tử từ trang đầu. */
export const totalOf = (data) => data?.pages?.[0]?.totalElements ?? 0;

/**
 * Options chuẩn cho useInfiniteQuery: fetcher nhận params đã có page/size.
 *   useInfiniteQuery(infinitePaged(qk.resale.list(params), resale.list, params))
 */
export const infinitePaged = (queryKey, fetcher, params = {}) => ({
  queryKey,
  queryFn: ({ pageParam }) => fetcher({ size: DEFAULT_PAGE_SIZE, ...params, page: pageParam }),
  initialPageParam: 0,
  getNextPageParam,
});
