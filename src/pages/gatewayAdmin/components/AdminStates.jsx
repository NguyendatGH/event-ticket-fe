// Trạng thái dùng chung cho mọi trang Gateway Admin (spec §30): loading / empty / error.
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingRows({ rows = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-6 text-sm">
      <p className="font-medium text-destructive">Không tải được dữ liệu</p>
      <p className="mt-1 text-muted-foreground">{error?.message ?? "Lỗi không xác định"}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 text-sm underline">
          Thử lại
        </button>
      )}
    </div>
  );
}

/** Gói loading/error/empty để trang không phải lặp ba nhánh này. */
export function AsyncSection({ query, empty, children, rows }) {
  if (query.isPending) return <LoadingRows rows={rows} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  const data = query.data;
  if (Array.isArray(data) && data.length === 0) return <EmptyState>{empty}</EmptyState>;
  return children(data);
}
