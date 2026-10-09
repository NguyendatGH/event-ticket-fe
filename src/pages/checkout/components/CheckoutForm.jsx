// Thân trang thanh toán (CheckoutPage render sau khi đã có `event`):

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { newIdempotencyKey, useAppConfig, useCreateOrder, usePublicPaymentMethods } from "@/api";
import { BackLink, Container, ImageWithFallback, Notice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { tierLimit } from "@/lib/business";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { applyApiErrors, toPayload, v, z } from "@/lib/forms";
import { fadeUp, stagger } from "@/lib/motion";
import { rememberPendingOrder } from "@/lib/pendingOrder";
import { CART_ERROR_CODES, EVENT_CLOSED_MESSAGE, goToGateway, isOnSale, parseTiers, serializeTiers, venueLine } from "@/lib/checkout";
import { BuyerFields } from "./BuyerFields";
import { MobilePayBar } from "./MobilePayBar";
import { OrderLines } from "@/components/order";
import { TierQuantityRow } from "./TierQuantityRow";
import { paymentMethodLabel } from "@/lib/constants";

const schema = z.object({
  customer: z.object({
    name: v.required("Họ và tên"),
    email: v.email(),
    phone: v.phone(),
  }),
});

export function CheckoutForm({ event, params, setParams, refetchEvent }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkoutFee } = useAppConfig();
  const [cartError, setCartError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const paymentMethodsQuery = usePublicPaymentMethods(event.organizer?.id);
  // Chỉ đoán "CARD" khi CHƯA có dữ liệu (đang tải / lỗi). BE trả mảng rỗng nghĩa là terminal đã tắt hết
  // phương thức BTC chọn: hiện CARD lúc đó là mời khách bấm vào một nút chắc chắn bị từ chối.
  const configuredPaymentMethods = paymentMethodsQuery.data ? paymentMethodsQuery.data.paymentMethods ?? [] : ["CARD"];
  const paymentMethods = [...new Set([...configuredPaymentMethods, "WALLET"])]
  const selectedPaymentMethod = paymentMethods.includes(paymentMethod) ? paymentMethod : paymentMethods[0];

  const tiers = useMemo(() => event.tiers || [], [event.tiers]);
  const quantities = useMemo(() => cartOf(params, tiers), [params, tiers]);

  const lines = tiers
    .filter((t) => quantities[t.id] > 0)
    .map((t) => ({ key: t.id, label: t.name, quantity: quantities[t.id], amount: t.price * quantities[t.id] }));
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const fee = lines.length ? checkoutFee : 0;
  const onSale = isOnSale(event);

  const setParamsRef = useRef(setParams);
  useLayoutEffect(() => {
    setParamsRef.current = setParams;
  });
  const setQuantity = useCallback(
    (tierId, q) => {
      setCartError(null);
      setParamsRef.current(
        (next) => {
          const tiersParam = serializeTiers({ ...cartOf(next, tiers), [tierId]: q });
          if (tiersParam) next.set("tiers", tiersParam);
          else next.delete("tiers");
          return next;
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [tiers]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { customer: { name: user?.fullName ?? "", email: user?.email ?? "", phone: user?.phone ?? "" } },
  });
  const { errors } = form.formState;

  const createOrder = useCreateOrder();
  const busy = createOrder.isPending || redirecting;

  useEffect(() => {
    const onShow = (e) => e.persisted && setRedirecting(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const onSubmit = form.handleSubmit((values) => {
    if (!lines.length) {
      setCartError({ message: "Chọn ít nhất một vé để tiếp tục." });
      return;
    }
    setCartError(null);
    const body = {
      eventId: event.id,
      items: lines.map((l) => ({ tierId: l.key, quantity: l.quantity })),
      customer: toPayload(values.customer),
      paymentMethod: selectedPaymentMethod,
    };
    createOrder.mutate(
      { body, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: (order) => {
          const url = order?.payment?.checkoutUrl;
          if (url) {
            rememberPendingOrder(order.id);
            setRedirecting(true);
            goToGateway(url);
          } else {
            navigate(`/orders/${order.id}`);
          }
        },
        onError: (err) => {
          if (CART_ERROR_CODES.includes(err.code)) {
            setCartError(err);
            if (err.code !== "PAYMENT_LINK_FAILED") refetchEvent();
          } else if (err.errors?.length || err.code === "VALIDATION") {
            applyApiErrors(form, err);
          } else {
            toast.error(err.message);
          }
        },
      }
    );
  });

  const summaryRef = useRef(null);
  const showBar = useBelowFold(summaryRef) && lines.length > 0 && onSale;

  let submitLabel = "Thanh toán";
  if (redirecting) submitLabel = "Đang chuyển tới cổng thanh toán…";
  else if (createOrder.isPending) submitLabel = "Đang tạo đơn…";

  return (
    <Container className="pb-24">
      <div className="pt-8">
        <BackLink to={`/events/${event.slug}`}>Quay lại sự kiện</BackLink>
      </div>

      <header className="border-b border-border pt-8 pb-8 md:pb-10">
        <h1 className="text-h1 text-foreground">Thanh toán</h1>
        <p className="mt-3 max-w-[60ch] text-body-lg text-secondary-foreground">
          Chọn số lượng vé và điền thông tin người nhận. Vé được giữ 15 phút sau khi bạn bấm thanh toán.
        </p>
      </header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-12 pt-10 md:pt-12 lg:grid-cols-12 lg:gap-16"
      >
        <motion.div variants={fadeUp} className="space-y-14 lg:col-span-7">
          <div className="flex gap-5">
            <ImageWithFallback src={event.coverImageUrl} alt={event.coverImageAlt || ""} className="aspect-card w-28 shrink-0 sm:w-40" />
            <div className="min-w-0 space-y-1.5">
              <p className="eyebrow text-primary tabular-nums">{formatDateLong(event.startsAt)}</p>
              <p className="text-h3 text-foreground">{event.name}</p>
              <p className="text-sm text-secondary-foreground tabular-nums">
                {formatTimeRange(event.startsAt, event.endsAt)}
                {event.venue ? ` · ${venueLine(event.venue)}` : ""}
              </p>
            </div>
          </div>

          <section aria-labelledby="co-tiers">
            <StepTitle id="co-tiers" num="01" title="Chọn vé" />
            {!onSale ? (
              <Notice tone="warning" title={EVENT_CLOSED_MESSAGE[event.status] || "Sự kiện không mở bán."} className="mb-6" />
            ) : null}
            {tiers.length ? (
              <ul className="border-t border-border">
                {tiers.map((t) => (
                  <TierQuantityRow
                    key={t.id}
                    tier={t}
                    quantity={quantities[t.id] || 0}
                    onChange={setQuantity}
                    disabled={busy || !onSale}
                  />
                ))}
              </ul>
            ) : (
              <p className="border-t border-border py-6 text-sm text-muted-foreground">Sự kiện chưa có hạng vé nào.</p>
            )}
          </section>

          <section aria-labelledby="co-buyer">
            <StepTitle id="co-buyer" num="02" title="Thông tin người nhận" />
            <form id="checkout-form" noValidate onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
              <BuyerFields form={form} />
            </form>
          </section>

          <section aria-labelledby="co-payment-method">
            <StepTitle id="co-payment-method" num="03" title="Phương thức thanh toán" />
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <label key={method} className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${paymentMethod === method ? "border-primary bg-primary/5" : "border-border hover:border-border-hover"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={selectedPaymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    disabled={busy}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">{paymentMethodLabel(method)}</span>
                </label>
              ))}
            </div>
          </section>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-5">
          <div ref={summaryRef} className="rounded-md border border-border bg-background-2 p-6 md:p-8 lg:sticky lg:top-24">
            <OrderLines live lines={lines} fee={lines.length ? fee : null} total={subtotal + fee} />

            <div className="mt-8 space-y-4">
              {cartError ? (
                <Notice tone="danger" title={cartError.message}>
                  {["TIER_SOLD_OUT", "QUANTITY_EXCEEDED"].includes(cartError.code) ? "Số lượng còn lại đã được cập nhật. Chỉnh lại giỏ vé rồi thử lại." : null}
                  {cartError.code === "PAYMENT_LINK_FAILED" ? "Đơn chưa được tạo nên bạn chưa bị trừ tiền." : null}
                </Notice>
              ) : null}
              {errors.root?.server ? <Notice tone="danger" title={errors.root.server.message} /> : null}

              <Button type="submit" form="checkout-form" size="lg" className="w-full" disabled={busy || !onSale || !tiers.length}>
                {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Lock aria-hidden="true" />}
                {submitLabel}
              </Button>
              <p className="text-caption leading-relaxed font-normal text-muted-foreground">
                Bạn sẽ được chuyển sang cổng thanh toán để hoàn tất. Vé được phát hành ngay khi thanh toán thành công.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <MobilePayBar show={showBar} total={subtotal + fee} busy={busy} />
    </Container>
  );
}

function StepTitle({ id, num, title }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="text-caption text-muted-foreground tabular-nums">{num}</span>
      <h2 id={id} className="text-h3 text-foreground">
        {title}
      </h2>
    </div>
  );
}

function useBelowFold(ref) {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setBelow(!e.isIntersecting && e.boundingClientRect.top > 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return below;
}

function cartOf(search, tiers) {
  const raw = parseTiers(search.get("tiers"));
  return Object.fromEntries(tiers.map((t) => [t.id, Math.min(raw[t.id] || 0, tierLimit(t))]));
}

