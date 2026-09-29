// Trang thanh toán thành công — route /checkout/success?order=<orderId>
// Dữ liệu: useEvent, useOrder.

import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { useEvent, useOrder } from "@/api";
import { Container, Disclosure, EmptyState, ErrorState, Notice, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatVND } from "@/lib/format";
import { fadeUp, heroLine, stagger, staggerOf } from "@/lib/motion";
import { EventAside, IssuedTickets, PaymentDetails, SPLIT_ASIDE, SPLIT_GRID } from "@/components/order";
import { SuccessMark } from "./components/SuccessMark";

export default function CheckoutSuccessPage() {
  useDocumentTitle("Thanh toán thành công");
  const [params] = useSearchParams();
  const orderId = params.get("order") || "";
  const { isAuthenticated } = useAuth();
  const orderQ = useOrder(orderId);
  const order = orderQ.data;
  const eventQ = useEvent(order?.eventSlug);

  if (!orderId) return <MissingOrder />;
  if (orderQ.isPending) return <SuccessSkeleton />;
  if (orderQ.isError) {
    return (
      <Container>
        <ErrorState error={orderQ.error} onRetry={orderQ.refetch} />
      </Container>
    );
  }

  const paid = order.status === "PAID";
  const tickets = order.tickets || [];

  let title;
  let description;
  if (!paid) {
    title = "Đơn hàng chưa hoàn tất";
    description = "Đơn này chưa được thanh toán thành công. Xem trang đơn hàng để biết trạng thái mới nhất.";
  } else {
    title = "Vé của bạn đã sẵn sàng";
    description = (
      <>
        Mã đơn <code className="text-foreground">{order.orderCode}</code>. Xác nhận đã được gửi tới {order.customer?.email}.
      </>
    );
  }

  return (
    <Container className="pb-24">
      <motion.div variants={stagger} initial="hidden" animate="show" className={SPLIT_GRID}>
        <motion.div variants={staggerOf(0.08, paid ? 0.5 : 0)} className="lg:col-span-7">
          {paid ? (
            <div className="flex items-center gap-4">
              <SuccessMark size={48} />
              <p className="eyebrow text-primary">Đã thanh toán</p>
            </div>
          ) : (
            <StatusBadge kind="order" status={order.status} />
          )}
          <motion.h1 variants={heroLine} className="mt-6 text-h1 text-balance text-foreground">
            {title}
          </motion.h1>
          <motion.p variants={heroLine} className="mt-4 max-w-[60ch] text-body-lg text-secondary-foreground">
            {description}
          </motion.p>

          {paid ? (
            <motion.p variants={fadeUp} className="mt-6 text-sm text-muted-foreground tabular-nums">
              Đã thanh toán <span className="text-foreground">{formatVND(order.totalAmount)}</span>
            </motion.p>
          ) : null}

          {paid && tickets.length ? (
            <motion.section variants={fadeUp} aria-labelledby="success-tickets" className="mt-12">
              <h2 id="success-tickets" className="eyebrow mb-4">
                Vé của bạn ({tickets.length})
              </h2>
              <IssuedTickets tickets={tickets} eventName={order.eventName} linkToTicket={isAuthenticated} delayRows={14} />
            </motion.section>
          ) : null}

          {paid && !isAuthenticated ? (
            <Notice className="mt-8" title="Bạn đang mua với tư cách khách.">
              Vé nằm trong email xác nhận và trên trang đơn hàng. Hãy lưu đường dẫn trang đơn để mở lại mã QR khi cần.
            </Notice>
          ) : null}

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
            {paid && isAuthenticated ? (
              <>
                <Button asChild size="lg">
                  <Link to="/me/tickets">Xem vé của tôi</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to={`/orders/${order.id}`}>Chi tiết đơn hàng</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to={`/orders/${order.id}`}>Xem đơn hàng</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/events">Khám phá sự kiện</Link>
                </Button>
              </>
            )}
          </motion.div>

          {order.payment ? (
            <motion.div variants={fadeUp}>
              <Disclosure className="mt-14">
                <PaymentDetails order={order} />
              </Disclosure>
            </motion.div>
          ) : null}
        </motion.div>

        <motion.div variants={fadeUp} className={SPLIT_ASIDE}>
          <EventAside
            event={eventQ.data ?? { slug: order.eventSlug, name: order.eventName }}
            loading={eventQ.isPending && Boolean(order.eventSlug)}
            className="lg:sticky lg:top-24"
          />
        </motion.div>
      </motion.div>
    </Container>
  );
}

function MissingOrder() {
  return (
    <Container>
      <EmptyState
        title="Không tìm thấy đơn hàng"
        description="Đường dẫn thiếu mã đơn. Vé đã mua nằm trong email xác nhận hoặc mục Vé của tôi."
        action={
          <Button asChild>
            <Link to="/me/tickets">Vé của tôi</Link>
          </Button>
        }
      />
    </Container>
  );
}

function SuccessSkeleton() {
  return (
    <Container className="pb-24" role="status" aria-label="Đang tải">
      <div className={SPLIT_GRID}>
        <div className="lg:col-span-7">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-5 h-12 w-4/5" />
          <Skeleton className="mt-5 h-5 w-3/5" />
          <div className="mt-14 border-t border-border">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-8 border-b border-border py-6">
                <Skeleton className="size-[136px] shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <EventAside loading className={SPLIT_ASIDE} />
      </div>
    </Container>
  );
}
