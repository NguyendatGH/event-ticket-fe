// Dưới header có vạch chia → khoảng trên gọn hơn trang thành công/thất bại.
// Dữ liệu: useCancelOrder, useEvent, useOrder.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useCancelOrder, useEvent, useOrder } from "@/api";
import { ConfirmDialog, Container, Disclosure, EmptyState, ErrorState, KeyValueList, Notice, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDateTime, formatTime } from "@/lib/format";
import { fadeUp, stagger } from "@/lib/motion";
import { rememberPendingOrder } from "@/lib/pendingOrder";
import { cn } from "@/lib/utils";
import { OrderLines } from "@/components/order";
import { EventAside, IssuedTickets, PaymentDetails, SPLIT_ASIDE, SPLIT_GRID } from "@/components/order";
import { orderToLines, retryHref } from "@/lib/checkout";

const POLL_MS = 5000;
const GRID = cn(SPLIT_GRID, "pt-10 md:pt-12");

export default function OrderPage() {
  const { id } = useParams();
  useDocumentTitle("Chi tiết đơn hàng");
  const orderQ = useOrder(id, { poll: true, pollInterval: POLL_MS });
  const order = orderQ.data;

  let content;
  if (orderQ.isPending) {
    content = <OrderSkeleton />;
  } else if (orderQ.isError && orderQ.error?.isNotFound) {
    content = (
      <EmptyState
        title="Không tìm thấy đơn hàng"
        description="Đơn có thể đã bị xóa hoặc đường dẫn không đúng."
        action={
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        }
      />
    );
  } else if (orderQ.isError) {
    content = <ErrorState error={orderQ.error} onRetry={orderQ.refetch} />;
  } else {
    content = <OrderBody order={order} />;
  }

  return (
    <Container className="pb-24">
      <header className="border-b border-border pt-10 pb-8 md:pt-14 md:pb-10">
        <p className="eyebrow tabular-nums">
          {order ? (
            <>
              Mã đơn <code>{order.orderCode}</code>
            </>
          ) : (
            "Đơn hàng"
          )}
        </p>
        <h1 className="mt-3 text-h1 text-foreground">Chi tiết đơn hàng</h1>
        {order ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <StatusBadge kind="order" status={order.status} />
            <Link to={`/events/${order.eventSlug}`} className="link-quiet">
              {order.eventName}
            </Link>
          </div>
        ) : null}
      </header>

      {content}
    </Container>
  );
}

function OrderBody({ order }) {
  const { isAuthenticated } = useAuth();
  const eventQ = useEvent(order.eventSlug);
  const pending = order.status === "PENDING_PAYMENT";
  const closed = order.status === "EXPIRED" || order.status === "CANCELLED";
  const payUrl = pending ? order.payment?.checkoutUrl : null;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancel = useCancelOrder();

  const doCancel = () =>
    cancel.mutate(order.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success("Đã hủy đơn. Vé đã được trả lại.");
      },
      onError: (err) => {
        setConfirmOpen(false);
        toast.error(err.message);
      },
    });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className={GRID}>
      <motion.div variants={fadeUp} className="space-y-12 lg:col-span-7">
        {pending ? (
          <div className="space-y-6">
            <Notice tone="info" title={payUrl ? "Đơn đang chờ thanh toán." : "Chưa tạo được liên kết thanh toán."}>
              {order.expiresAt ? <HoldCountdown expiresAt={order.expiresAt} /> : "Vé đang được giữ cho bạn."}
            </Notice>
            <div className="flex flex-wrap gap-3">
              {payUrl ? (
                <Button asChild size="lg">
                  <a href={payUrl} onClick={() => rememberPendingOrder(order.id)}>
                    <Lock aria-hidden="true" />
                    Thanh toán
                  </a>
                </Button>
              ) : null}
              <Button size="lg" variant="ghost" onClick={() => setConfirmOpen(true)}>
                Hủy đơn
              </Button>
            </div>
          </div>
        ) : null}

        {order.status === "MANUAL_REVIEW" ? (
          <Notice tone="warning" title="Thanh toán đang được đối soát.">
            Tiền về sau khi đơn đã hết thời gian giữ chỗ. Chúng tôi sẽ cấp vé hoặc hoàn tiền trong thời gian sớm nhất.
          </Notice>
        ) : null}

        {closed ? (
          <Notice title={order.status === "EXPIRED" ? "Đơn đã hết thời gian giữ chỗ." : "Đơn đã được hủy."}>
            Vé đã được trả lại, bạn chưa bị trừ tiền.{" "}
            <Link to={retryHref(order)} className="link-accent">
              Đặt lại
            </Link>
          </Notice>
        ) : null}

        {order.tickets?.length ? (
          <section aria-labelledby="order-tickets">
            <h2 id="order-tickets" className="eyebrow mb-4">
              Vé đã cấp ({order.tickets.length})
            </h2>
            <IssuedTickets tickets={order.tickets} eventName={order.eventName} linkToTicket={isAuthenticated} />
          </section>
        ) : null}

        <OrderLines title="Chi tiết thanh toán" lines={orderToLines(order)} fee={order.feeAmount} total={order.totalAmount} className="max-w-xl" />

        <section aria-labelledby="order-buyer">
          <h2 id="order-buyer" className="eyebrow mb-4">
            Người nhận
          </h2>
          <KeyValueList
            items={[
              { label: "Họ và tên", value: order.customer?.name },
              { label: "Email", value: order.customer?.email },
              { label: "Điện thoại", value: order.customer?.phone },
              { label: "Tạo lúc", value: formatDateTime(order.createdAt) },
              { label: "Thanh toán lúc", value: order.paidAt ? formatDateTime(order.paidAt) : null },
            ]}
          />
        </section>

        {order.payment ? (
          <Disclosure>
            <PaymentDetails order={order} />
          </Disclosure>
        ) : null}
      </motion.div>

      <motion.div variants={fadeUp} className={SPLIT_ASIDE}>
        <EventAside
          event={eventQ.data ?? { slug: order.eventSlug, name: order.eventName }}
          loading={eventQ.isPending}
          className="lg:sticky lg:top-24"
        />
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hủy đơn hàng này?"
        description="Vé đang giữ sẽ được trả lại cho người khác mua. Bạn có thể đặt đơn mới sau."
        confirmLabel="Hủy đơn"
        cancelLabel="Giữ đơn"
        destructive
        loading={cancel.isPending}
        onConfirm={doCancel}
      />
    </motion.div>
  );
}

const pad = (n) => String(n).padStart(2, "0");

function HoldCountdown({ expiresAt }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  return (
    <span className="tabular-nums">
      Vé được giữ tới {formatTime(expiresAt)}
      {left > 0 ? ` (còn ${pad(Math.floor(left / 60))}:${pad(left % 60)}).` : ". Đơn sắp hết hạn."}
    </span>
  );
}

function OrderSkeleton() {
  return (
    <div className={GRID} role="status" aria-label="Đang tải">
      <div className="space-y-12 lg:col-span-7">
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
      <EventAside loading className={SPLIT_ASIDE} />
    </div>
  );
}
