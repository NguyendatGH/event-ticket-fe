import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/site";
import { useAppConfig } from "@/api";
import { tierLimit } from "@/lib/business";
import { formatNumber, formatVND } from "@/lib/format";
import { DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { checkoutHref, purchaseState, summarize } from "../lib";
import { QuantityStepper } from "./QuantityStepper";

function tierHint({ tier, soldOut, upcoming, low, open }) {
  if (soldOut) return "Hết vé";
  if (upcoming) return "Chưa mở bán";
  if (!open) return null;
  if (low) return `Còn ${formatNumber(tier.available)} vé`;
  return `Tối đa ${tier.maxPerOrder} vé mỗi đơn`;
}

function buyLabel(state, count) {
  if (!state.open) return state.cta;
  if (count === 0) return "Chọn số lượng vé";
  return `Mua ${count} vé`;
}

export function TicketSelector({ event }) {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const tiers = event.tiers ?? [];
  const state = purchaseState(event.status);
  const { checkoutFee } = useAppConfig();
  const { lines, count, subtotal, fee, total } = summarize(tiers, quantities, checkoutFee);

  const setQuantity = (tierId, qty) =>
    setQuantities((prev) => ({ ...prev, [tierId]: qty }));
  const upcoming = event.status === "UPCOMING";

  return (
    <div
      id="chon-ve"
      className="scroll-mt-24 border border-border bg-background-2"
    >
      <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
        <h2 className="heading-caps">Chọn hạng vé</h2>
        {event.priceFrom != null ? (
          <Price value={event.priceFrom} from size="sm" />
        ) : null}
      </div>

      {state.note ? (
        <p className="border-b border-border px-5 py-3.5 text-sm text-secondary-foreground">
          {state.note}
        </p>
      ) : null}

      {tiers.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">
          Ban tổ chức chưa công bố hạng vé.
        </p>
      ) : (
        <ul>
          {tiers.map((tier) => {
            const soldOut = !upcoming && (Number(tier.available) || 0) <= 0;
            const qty = quantities[tier.id] ?? 0;
            const low = state.open && !soldOut && tier.available <= 20;
            return (
              <li
                key={tier.id}
                className={cn(
                  "relative border-b border-border px-5 py-4 transition-colors last:border-b-0",
                  "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:origin-top before:bg-primary before:transition-transform before:duration-300 before:ease-out-expo",
                  qty > 0
                    ? "bg-surface before:scale-y-100"
                    : "before:scale-y-0",
                  soldOut && "opacity-55",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{tier.name}</p>
                    {tier.description ? (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                    ) : null}
                  </div>
                  <Price
                    value={tier.price}
                    size="md"
                    tone={soldOut ? "plain" : "accent"}
                  />
                </div>
                <div className="mt-3 flex min-h-8 items-center justify-between gap-4">
                  <p
                    className={cn(
                      "text-caption",
                      low
                        ? "rounded-sm bg-warning/10 px-1.5 py-0.5 text-warning"
                        : "text-muted-foreground",
                    )}
                  >
                    {tierHint({ tier, soldOut, upcoming, low, open: state.open })}
                  </p>
                  {state.open && !soldOut ? (
                    <QuantityStepper
                      tier={tier}
                      value={qty}
                      max={tierLimit(tier)}
                      onChange={(v) => setQuantity(tier.id, v)}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence initial={false}>
        {state.open && count > 0 ? (
          <motion.dl
            key="summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: DUR.moderate } }}
            exit={{ opacity: 0, transition: { duration: DUR.fast } }}
            className="space-y-2 border-t border-border px-5 py-4 text-sm"
          >
            {lines.map((l) => (
              <div key={l.id} className="flex justify-between gap-4">
                <dt className="text-secondary-foreground">
                  {l.name}{" "}
                  <span className="text-muted-foreground tabular-nums">
                    x{l.quantity}
                  </span>
                </dt>
                <dd className="tabular-nums">{formatVND(l.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-secondary-foreground">Phí dịch vụ</dt>
              <dd className="tabular-nums">{formatVND(fee)}</dd>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3">
              <dt className="eyebrow text-secondary-foreground">Tổng cộng</dt>
              <dd className="text-price text-primary tabular-nums">
                <AnimatedNumber
                  value={total}
                  from={total}
                  format={formatVND}
                  duration={0.4}
                />
              </dd>
            </div>
            <p className="sr-only" aria-live="polite">
              Đã chọn {count} vé, tạm tính {formatVND(subtotal)}
            </p>
          </motion.dl>
        ) : null}
      </AnimatePresence>

      <div className="border-t border-border p-5">
        <Button
          size="lg"
          variant={state.open ? "default" : "secondary"}
          className="w-full"
          disabled={!state.open || count === 0}
          onClick={() => navigate(checkoutHref(event.slug, lines))}
        >
          {buyLabel(state, count)}
          {state.open && count > 0 ? <ArrowRight aria-hidden="true" /> : null}
        </Button>
        {state.open ? (
          <p className="mt-3 text-center text-caption text-muted-foreground">
            Vé điện tử có mã QR, dùng được ngay sau khi thanh toán.
          </p>
        ) : null}
      </div>
    </div>
  );
}
