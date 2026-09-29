// Trả về ref để gắn vào phần tử cuối danh sách: chạm viewport → fetchNextPage.

import { useEffect, useRef } from "react";

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
