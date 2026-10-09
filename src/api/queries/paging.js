export const DEFAULT_PAGE_SIZE = 12;

const getNextPageParam = (last) => (last && last.number + 1 < last.totalPages ? last.number + 1 : undefined);

export const flattenPages = (data) => data?.pages?.flatMap((p) => p?.content ?? []) ?? [];

export const totalOf = (data) => data?.pages?.[0]?.totalElements ?? 0;

export const infinitePaged = (queryKey, fetcher, params = {}) => ({
  queryKey,
  queryFn: ({ pageParam }) => fetcher({ size: DEFAULT_PAGE_SIZE, ...params, page: pageParam }),
  initialPageParam: 0,
  getNextPageParam,
});
