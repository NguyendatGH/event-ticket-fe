/**
 * Trang thanh toán — route /checkout/:slug?tiers=<tierId>:<số lượng>,...
 *
 * - Tải sự kiện bằng useEvent(slug); giỏ vé nằm trên URL (?tiers=) để F5 / chia sẻ link không mất giỏ.
 * - Phần form (chọn vé + người nhận + tóm tắt + nút thanh toán) ở components/CheckoutForm.jsx,
 *   nơi gọi useCreateOrder (POST /orders) với Idempotency-Key rồi chuyển sang cổng thanh toán.
 * - Sơ đồ cả luồng mua vé: xem đầu file ./lib.js.
 */
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEvent } from "@/api";
import { Container, EmptyState, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CheckoutForm } from "./components/CheckoutForm";

export default function CheckoutPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const eventQ = useEvent(slug);
  const event = eventQ.data;
  useDocumentTitle(event ? `Thanh toán · ${event.name}` : "Thanh toán");

  if (eventQ.isPending) return <CheckoutSkeleton />;
  if (eventQ.isError) {
    return (
      <Container>
        {eventQ.error?.isNotFound ? (
          <EmptyState
            title="Không tìm thấy sự kiện"
            description="Sự kiện có thể đã bị gỡ hoặc đường dẫn không đúng."
            action={
              <Button asChild>
                <Link to="/events">Khám phá sự kiện</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={eventQ.error} onRetry={eventQ.refetch} />
        )}
      </Container>
    );
  }
  return <CheckoutForm event={event} params={params} setParams={setParams} refetchEvent={eventQ.refetch} />;
}

function CheckoutSkeleton() {
  return (
    <Container className="pb-24" role="status" aria-label="Đang tải">
      <div className="pt-8">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="border-b border-border pt-8 pb-10">
        <Skeleton className="h-11 w-56" />
        <Skeleton className="mt-4 h-5 w-full max-w-lg" />
      </div>
      <div className="grid gap-12 pt-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          <div className="flex gap-5">
            <Skeleton className="aspect-card w-40 rounded-none" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
          <div className="border-t border-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border py-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </Container>
  );
}
