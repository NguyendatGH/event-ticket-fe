import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfiniteSentinel } from "@/hooks/useInfiniteSentinel";
import { cn } from "@/lib/utils";

/**
 * Đặt cuối danh sách infinite: tự tải trang tiếp khi cuộn tới, kèm nút "Tải thêm" dự phòng.
 *   const q = useInfiniteEvents(params);  …  <InfiniteSentinel query={q} />
 */
export function InfiniteSentinel({ query, endLabel = "Đã hiển thị tất cả", className }) {
  const ref = useInfiniteSentinel(query);
  const { hasNextPage, isFetchingNextPage, fetchNextPage, isFetchNextPageError, data } = query;
  const hasItems = (data?.pages?.[0]?.content?.length ?? 0) > 0;

  return (
    <div ref={ref} className={cn("flex min-h-16 items-center justify-center py-10", className)}>
      {isFetchingNextPage ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Đang tải thêm" />
      ) : hasNextPage ? (
        <Button variant="secondary" onClick={() => fetchNextPage()}>
          {isFetchNextPageError ? "Lỗi tải trang. Thử lại" : "Tải thêm"}
        </Button>
      ) : hasItems && endLabel ? (
        <p className="text-caption text-disabled-foreground">{endLabel}</p>
      ) : null}
    </div>
  );
}
