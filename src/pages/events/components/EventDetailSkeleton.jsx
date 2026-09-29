// Khung chờ trang chi tiết sự kiện.

import { Container } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";

export function EventDetailSkeleton() {
  return (
    <div role="status" aria-label="Đang tải sự kiện">
      <Skeleton className="h-[clamp(240px,42vw,580px)] w-full rounded-none" />
      <Container className="grid gap-x-16 gap-y-10 pt-12 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
          <div className="space-y-3 pt-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3 pt-10">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${92 - i * 9}%` }}
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="space-y-4 border border-border p-5">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-2 border-t border-border pt-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Container>
    </div>
  );
}
