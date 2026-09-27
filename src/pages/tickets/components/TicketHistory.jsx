import { motion } from "motion/react";
import { TICKET_HISTORY_LABEL } from "@/lib/constants";
import { formatDateTime, formatVND } from "@/lib/format";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Lịch sử vé (TicketHistoryItem[] cũ → mới) dạng timeline dọc, mới nhất ở trên.
 *   ● Chuyển nhượng   1.250.000đ
 *   │ Nguyen A. → Tran B.   24.10.2026 19:30
 */
export function TicketHistory({ items = [] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>;
  const list = [...items].reverse();
  return (
    <ol className="relative ml-1.5">
      {/* Trục dọc tự vẽ từ trên xuống, các mốc hiện lần lượt theo nó. */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px origin-top bg-border"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: DUR.slower, ease: EASE_OUT }}
      />
      {list.map((h, i) => {
        const parties = [h.from?.displayName, h.to?.displayName].filter(Boolean);
        return (
          <motion.li
            key={`${h.type}-${h.at}-${i}`}
            className="relative pb-6 pl-6 last:pb-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.moderate, ease: EASE_OUT, delay: 0.08 + Math.min(i, 10) * 0.035 * 2 }}
          >
            <span
              aria-hidden="true"
              className={cn("absolute top-1.5 -left-[3.5px] size-2 rounded-full", i === 0 ? "bg-primary" : "bg-border-hover")}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-sm font-medium text-foreground">{TICKET_HISTORY_LABEL[h.type] || h.type}</p>
              {h.price != null ? <p className="text-sm text-foreground tabular-nums">{formatVND(h.price)}</p> : null}
            </div>
            <p className="mt-1 text-meta text-muted-foreground tabular-nums">
              {parties.length ? `${parties.join(" → ")} · ` : ""}
              {formatDateTime(h.at)}
            </p>
          </motion.li>
        );
      })}
    </ol>
  );
}
