import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Đang tải hồ sơ" className="space-y-4">
      <div className="flex items-center gap-5 rounded-card bg-card p-5 ring-1 ring-white/5 md:p-7">
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-6 rounded-card bg-card p-5 ring-1 ring-white/5 md:p-7">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          {[0, 1, 2].map((j) => (
            <div key={j} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
