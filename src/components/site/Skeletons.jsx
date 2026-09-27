/** Skeleton (khung xám nhấp nháy) dùng chung khi dữ liệu đang tải. */
import { NavProgress } from "@/components/motion/NavProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Khung xám của một EventCard lúc đang tải (cùng kích thước để không nhảy layout). */
function EventCardSkeleton({ className }) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden="true">
      <Skeleton className="aspect-card w-full rounded-none" />
      <Skeleton className="mt-4 h-3 w-20" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3.5 w-3/5" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

/** Lưới skeleton cùng số cột với EventGrid. */
export function EventGridSkeleton({ count = 8, className }) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4", className)} role="status" aria-label="Đang tải">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Fallback Suspense cho trang lazy: giữ chỗ (không nhảy footer) + vạch tiến trình mảnh trên cùng,
 * hiện sau 150ms nên tải nhanh không nháy spinner.
 */
export function PageLoader({ className, label = "Đang tải" }) {
  return (
    <div className={cn("min-h-[50vh]", className)} role="status">
      <NavProgress />
      <span className="sr-only">{label}</span>
    </div>
  );
}
