import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useEvent, useOrder } from "@/api";
import { Container, ErrorState, Notice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatTime } from "@/lib/format";
import { DUR, EASE_OUT, fadeUp, stagger } from "@/lib/motion";
import { OrderLines } from "./components/OrderLines";
import { EventAside, SPLIT_ASIDE, SPLIT_GRID } from "./components/OrderSummaryParts";
import { FAILURE_COPY, failureReason, orderOutcome, orderToLines, retryHref } from "./lib";

/**
 * Trang thanh toán thất bại — route /checkout/failed?order=<id>&reason=<lý do>
 * Dữ liệu: useOrder(orderId) + useEvent(order.eventSlug).
 * lý do (declined | timeout | cancelled), tóm tắt đơn, mua lại đúng giỏ cũ.
 * Trạng thái đơn thắng ?reason=: đơn đã PAID (vd bấm Back sau khi thanh toán lại thành công, hoặc link cũ)
 * → sang trang thành công; đang đối soát / đã sang giai đoạn khác → trang đơn. Tránh mời mua trùng.
 */
export default function CheckoutFailedPage() {
  useDocumentTitle("Thanh toán không thành công");
  const [params] = useSearchParams();
  const orderId = params.get("order") || "";
  const orderQ = useOrder(orderId);
  const order = orderQ.data;
  const eventQ = useEvent(order?.eventSlug);

  if (orderId && orderQ.isPending) return <FailedSkeleton />;
  if (orderQ.isError && !orderQ.error?.isNotFound) {
    return (
      <Container>
        <ErrorState error={orderQ.error} onRetry={orderQ.refetch} />
      </Container>
    );
  }

  const outcome = orderOutcome(order);
  if (order && outcome === "success") return <Navigate replace to={`/checkout/success?order=${order.id}`} />;
  if (order && (outcome === "review" || outcome === "other")) return <Navigate replace to={`/orders/${order.id}`} />;

  const reason = failureReason(order, params.get("reason"));
  const copy = FAILURE_COPY[reason] || FAILURE_COPY[""];
  const resale = order?.kind === "RESALE";
  // Bị từ chối nhưng đơn còn giữ chỗ: trả lại trên cùng link (BE giữ vé/tin tới expiresAt), không tạo đơn mới.
  const payAgain = order?.status === "PENDING_PAYMENT" && order.payment?.checkoutUrl;

  return (
    <Container className="pb-24">
      <motion.div variants={stagger} initial="hidden" animate="show" className={SPLIT_GRID}>
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <motion.span
            aria-hidden="true"
            className="mb-6 grid size-12 place-items-center rounded-full border border-destructive/60 text-destructive"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT }}
          >
            <X className="size-5" strokeWidth={1.75} />
          </motion.span>
          {order ? (
            <p className="eyebrow tabular-nums">
              Mã đơn <code>{order.orderCode}</code>
            </p>
          ) : null}
          <h1 className="mt-4 text-h1 text-foreground">Thanh toán không thành công</h1>
          <Notice tone="danger" title={copy.title} className="mt-8">
            {copy.body}
            {payAgain && order.expiresAt ? ` Vé vẫn được giữ cho bạn tới ${formatTime(order.expiresAt)}.` : null}
          </Notice>

          {order ? (
            <OrderLines title="Đơn hàng" lines={orderToLines(order)} fee={order.feeAmount} total={order.totalAmount} className="mt-12 max-w-xl" />
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            {order ? (
              <>
                <Button asChild size="lg">
                  {payAgain ? (
                    <a href={order.payment.checkoutUrl}>Thanh toán lại</a>
                  ) : (
                    <Link to={retryHref(order)}>{resale ? "Quay lại tin bán" : "Thử lại"}</Link>
                  )}
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to={resale ? "/resale" : `/events/${order.eventSlug}`}>{resale ? "Xem vé bán lại khác" : "Chọn lại vé"}</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg">
                <Link to="/events">Khám phá sự kiện</Link>
              </Button>
            )}
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            Bị trừ tiền nhưng chưa nhận được vé?{" "}
            <Link to="/contact" className="link-accent">
              Liên hệ hỗ trợ
            </Link>
          </p>
        </motion.div>

        {order ? (
          <motion.div variants={fadeUp} className={SPLIT_ASIDE}>
            <EventAside event={eventQ.data ?? { slug: order.eventSlug, name: order.eventName }} loading={eventQ.isPending} />
          </motion.div>
        ) : null}
      </motion.div>
    </Container>
  );
}

function FailedSkeleton() {
  return (
    <Container className="pb-24" role="status" aria-label="Đang tải">
      <div className={SPLIT_GRID}>
        <div className="lg:col-span-7">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-5 h-12 w-4/5" />
          <Skeleton className="mt-8 h-12 w-full max-w-lg" />
          <div className="mt-12 max-w-xl space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <EventAside loading className={SPLIT_ASIDE} />
      </div>
    </Container>
  );
}
