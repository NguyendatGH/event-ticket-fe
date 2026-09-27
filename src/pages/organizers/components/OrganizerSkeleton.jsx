import { Container } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";

/** Khung chờ trang ban tổ chức: dải bìa, logo, tên, mô tả. */
export function OrganizerSkeleton() {
  return (
    <div role="status" aria-label="Đang tải ban tổ chức">
      <Skeleton className="aspect-[3/1] max-h-[420px] w-full rounded-none md:aspect-[4/1]" />
      <Container className="grid gap-10 py-12 lg:grid-cols-12">
        <div className="flex gap-6 lg:col-span-8">
          <Skeleton className="size-24 shrink-0 rounded-sm" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-6 h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Container>
    </div>
  );
}
