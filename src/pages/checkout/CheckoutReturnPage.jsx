import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { useOrder } from "@/api";
import { Container, EmptyState, ErrorState, Notice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatVND } from "@/lib/format";
import { DUR, EASE_IN, EASE_INOUT, EASE_OUT } from "@/lib/motion";
import { clearPendingOrder, readPendingOrder } from "@/lib/pendingOrder";
import { cn } from "@/lib/utils";
import { RETURN_TIMEOUT_MS, failureReason, orderOutcome } from "./lib";

/**
 * Trang chờ kết quả thanh toán — route /checkout/return?orderId=<id>
 * (không có ?orderId= thì đọc id đã nhớ bằng readPendingOrder, vì cổng thật không luôn trả orderId).
 *
 * Cổng thanh toán đưa khách về đây. Poll GET /orders/{id} (2s) tới khi đơn có kết quả rồi chuyển trang:
 * PAID → success; hết hạn/hủy/thanh toán lỗi → failed?reason=; MANUAL_REVIEW → giải thích tại chỗ;
 * quá 90 giây chưa có kết quả → mời xem trang đơn.
 */
export default function CheckoutReturnPage() {
  useDocumentTitle("Đang xác nhận thanh toán");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [orderId] = useState(() => params.get("orderId") || readPendingOrder());
  const [timedOut, setTimedOut] = useState(false);

  const orderQ = useOrder(orderId, { poll: !timedOut });
  const order = orderQ.data;
  const outcome = orderOutcome(order);

  useEffect(() => {
    if (!orderId) return undefined;
    const t = setTimeout(() => setTimedOut(true), RETURN_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [orderId]);

  useEffect(() => {
    if (!order || outcome === "pending") return;
    clearPendingOrder();
    if (outcome === "success") navigate(`/checkout/success?order=${order.id}`, { replace: true });
    else if (outcome === "failed") navigate(`/checkout/failed?order=${order.id}&reason=${failureReason(order)}`, { replace: true });
    else if (outcome === "other") navigate(`/orders/${order.id}`, { replace: true });
  }, [order, outcome, navigate]);

  if (!orderId) {
    return (
      <Container>
        <EmptyState
          title="Không tìm thấy đơn hàng"
          description="Đường dẫn thiếu mã đơn. Nếu bạn vừa thanh toán, kiểm tra email xác nhận hoặc mục Vé của tôi."
          action={
            <Button asChild>
              <Link to="/">Về trang chủ</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (orderQ.isError && !order) {
    return (
      <Container>
        <ErrorState error={orderQ.error} onRetry={orderQ.refetch} />
      </Container>
    );
  }

  const orderLink = (
    <Button asChild variant="secondary">
      <Link to={`/orders/${orderId}`}>Xem đơn hàng</Link>
    </Button>
  );

  let title = "Đang xác nhận thanh toán";
  let body = <p className="text-body-lg text-secondary-foreground">Thường chỉ mất vài giây. Vui lòng không đóng trang này.</p>;
  let waiting = true;
  let stateKey = "waiting";

  if (outcome === "review") {
    waiting = false;
    stateKey = "review";
    title = "Thanh toán đang được đối soát";
    body = (
      <>
        <Notice tone="warning" title="Tiền về sau khi đơn đã hết thời gian giữ chỗ.">
          Chúng tôi sẽ đối soát và cấp vé hoặc hoàn tiền trong thời gian sớm nhất. Bạn không cần thanh toán lại.
        </Notice>
        <div className="mt-10">{orderLink}</div>
      </>
    );
  } else if (timedOut && outcome === "pending") {
    waiting = false;
    stateKey = "timeout";
    title = "Chưa nhận được kết quả thanh toán";
    body = (
      <>
        <p className="text-body-lg text-secondary-foreground">
          Ngân hàng có thể báo chậm vài phút. Trạng thái sẽ tự cập nhật trên trang đơn hàng, bạn không cần thanh toán lại.
        </p>
        <div className="mt-10">{orderLink}</div>
      </>
    );
  }

  return (
    <Container className="py-20 md:py-28">
      <div className="max-w-2xl" aria-busy={waiting}>
        <p className="eyebrow">
          {order ? (
            <>
              Mã đơn <code>{order.orderCode}</code>
            </>
          ) : (
            "Thanh toán"
          )}
        </p>
        {/* Đang chờ → kết quả: nội dung cũ mờ đi rồi nội dung mới hiện lên (không nhảy chữ). */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stateKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: DUR.base, ease: EASE_IN } }}
          >
            <h1 className="mt-4 text-h1 text-foreground" aria-live="polite">
              {title}
            </h1>
            <div className="mt-5">{body}</div>

            {waiting ? (
              <div className="mt-12 max-w-md">
                <ProgressSteps confirmed={Boolean(order)} />
                <IndeterminateBar className="mt-8" />
                {order ? (
                  <p className="mt-4 text-sm text-muted-foreground tabular-nums">
                    {order.eventName} · {formatVND(order.totalAmount)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </Container>
  );
}

/** 3 bước để người mua thấy tiến trình thay vì một vòng xoay: rời cổng ✓ → chờ ngân hàng (đang chạy) → phát hành vé. */
function ProgressSteps({ confirmed }) {
  const steps = [
    { label: "Đã rời cổng thanh toán", state: "done" },
    { label: confirmed ? "Đang chờ ngân hàng xác nhận" : "Đang tải đơn hàng", state: "active" },
    { label: "Phát hành vé điện tử", state: "todo" },
  ];
  return (
    <ol className="space-y-4">
      {steps.map((st, i) => (
        <motion.li
          key={st.label}
          className="flex items-center gap-3 text-ui"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DUR.moderate, ease: EASE_OUT, delay: 0.15 + i * 0.08 }}
        >
          <StepDot state={st.state} />
          <span className={cn(st.state === "todo" ? "text-muted-foreground" : "text-foreground")}>{st.label}</span>
        </motion.li>
      ))}
    </ol>
  );
}

function StepDot({ state }) {
  const reduce = useReducedMotion();
  if (state === "done") {
    return (
      <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative grid size-5 place-items-center" aria-hidden="true">
        {!reduce ? (
          <motion.span
            className="absolute inset-0 rounded-full border border-primary"
            animate={{ scale: [0.6, 1.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.4, ease: EASE_OUT, repeat: Infinity }}
          />
        ) : null}
        <span className="size-2 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span className="grid size-5 place-items-center" aria-hidden="true">
      <span className="size-2 rounded-full border border-border-hover" />
    </span>
  );
}

/** Vạch chạy qua lại (không có % thật để hiện); reduced motion → vạch tĩnh. */
function IndeterminateBar({ className }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative h-px w-full overflow-hidden bg-border", className)} aria-hidden="true">
      {reduce ? null : (
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-primary to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "300%" }}
          transition={{ duration: 1.6, ease: EASE_INOUT, repeat: Infinity }}
        />
      )}
    </div>
  );
}
