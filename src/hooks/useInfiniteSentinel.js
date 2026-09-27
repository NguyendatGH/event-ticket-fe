import { useEffect, useRef } from "react";

/**
 * Infinite scroll: gắn ref vào phần tử cuối danh sách, chạm viewport → fetchNextPage.
 *   const ref = useInfiniteSentinel(query);   // query = kết quả useInfiniteQuery
 *   <div ref={ref} />
 */
export function useInfiniteSentinel({ hasNextPage, isFetchingNextPage, fetchNextPage }, { rootMargin = "400px 0px" } = {}) {
  const ref = useRef(null);
  const latest = useRef(fetchNextPage);
  useEffect(() => {
    latest.current = fetchNextPage;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasNextPage || isFetchingNextPage || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) latest.current();
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, rootMargin]);

  return ref;
}
