import { motion } from "motion/react";
import { TICKET_HISTORY_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { EASE_OUT, inView, riseSm, staggerOf } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { describeHistory } from "../lib";

/** Đoạn nối giữa hai chấm: vẽ từ trên xuống (scaleY 0 → 1) khi dòng hiện ra. */
const connector = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.1 } },
};

/**
 * Lịch sử giao dịch (TicketHistoryItem[] cũ → mới), hiển thị mới nhất lên đầu.
 * Cột ngày giờ (desktop), vạch dọc 1px, loại + mô tả. Các dòng hiện lần lượt khi cuộn tới.
 */
export function HistoryTimeline({ items = [], className }) {
  const rows = [...items].reverse();
  return (
    <motion.ol variants={staggerOf(0.08)} {...inView} className={cn("relative", className)}>
      {rows.map((item, i) => {
        const when = formatDateTime(item.at);
        return (
          <motion.li key={`${item.type}-${item.at}-${i}`} variants={riseSm} className="flex gap-4">
            <time dateTime={item.at} className="hidden w-33 shrink-0 pt-px text-sm text-muted-foreground tabular-nums sm:block">
              {when}
            </time>
            <div className="relative flex w-3 shrink-0 justify-center" aria-hidden="true">
              <span className={cn("relative z-10 mt-1.75 size-1.75", i === 0 ? "bg-primary" : "bg-border-hover")} />
              {i < rows.length - 1 ? <motion.span variants={connector} className="absolute top-4 -bottom-0.75 w-px origin-top bg-border" /> : null}
            </div>
            <div className={cn("min-w-0", i < rows.length - 1 && "pb-7")}>
              <p className="text-sm font-medium text-foreground">{TICKET_HISTORY_LABEL[item.type] || item.type}</p>
              <p className="mt-1 text-sm text-secondary-foreground">{describeHistory(item)}</p>
              <time dateTime={item.at} className="mt-1 block text-caption text-muted-foreground tabular-nums sm:hidden">
                {when}
              </time>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
