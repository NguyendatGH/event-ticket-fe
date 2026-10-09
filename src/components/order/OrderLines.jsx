import { AnimatePresence, motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion";
import { DUR, EASE_IN, EASE_OUT } from "@/lib/motion";
import { formatVND } from "@/lib/format";

export function OrderLines({ title = "Đơn hàng của bạn", lines = [], fee, total, empty = "Chưa chọn vé", live = false, className, children }) {
  return (
    <section aria-label={title} className={className}>
      {title ? <h2 className="eyebrow mb-4">{title}</h2> : null}
      {lines.length === 0 ? (
        <p className="border-b border-border pb-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="border-b border-border pb-1">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.li
                key={l.key}
                initial={live ? { opacity: 0, height: 0 } : false}
                animate={{ opacity: 1, height: "auto", transition: { duration: DUR.moderate, ease: EASE_OUT } }}
                exit={{ opacity: 0, height: 0, transition: { duration: DUR.base, ease: EASE_IN } }}
                className="overflow-hidden"
              >
                <div className="flex items-baseline justify-between gap-4 pb-3 text-sm">
                  <span className="min-w-0 text-secondary-foreground">
                    <span className="text-foreground">{l.label}</span>
                    {l.quantity != null ? <span className="ml-2 text-muted-foreground tabular-nums">× {l.quantity}</span> : null}
                  </span>
                  {live ? (
                    <AnimatedNumber value={l.amount} from={l.amount} format={formatVND} duration={DUR.slow} className="shrink-0 text-foreground" />
                  ) : (
                    <span className="shrink-0 text-foreground tabular-nums">{formatVND(l.amount)}</span>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      {fee != null ? (
        <div className="flex items-baseline justify-between gap-4 border-b border-border py-4 text-sm">
          <span className="text-secondary-foreground">Phí dịch vụ</span>
          <span className="text-foreground tabular-nums">{formatVND(fee)}</span>
        </div>
      ) : null}
      <div className="flex items-baseline justify-between gap-4 pt-4">
        <span className="heading-caps">Tổng</span>
        <span className="text-price text-primary tabular-nums" data-testid="order-total">
          {live ? <AnimatedNumber value={total} from={total} format={formatVND} duration={DUR.slow} /> : formatVND(total)}
        </span>
      </div>
      {children}
    </section>
  );
}

