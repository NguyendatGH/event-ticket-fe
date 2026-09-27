import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { DUR, EASE_OUT, HAS_IO, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Thanh tỉ lệ (đã bán / tổng, doanh thu tương đối) vẽ bằng scaleX thay vì width.
 * value 0..1. Lấp đầy khi cuộn tới (once), đổi giá trị thì trượt tiếp. min: tối thiểu để 1% vẫn thấy được.
 *   <Meter value={sold / total} className="h-1.5" />
 * Quan sát khung (track), không quan sát phần lấp: phần lấp đang scaleX(0) rộng 0px, nằm trong vùng overflow
 * (bảng overflow-x-auto) thì IntersectionObserver không bao giờ báo giao nhau → thanh đứng yên ở 0.
 */
export function Meter({ value = 0, min = 0.02, delay = 0, label, className, fillClassName }) {
  const v = Math.max(0, Math.min(1, Number(value) || 0));
  const shown = v > 0 ? Math.max(v, min) : 0;
  const ref = useRef(null);
  const seen = useInView(ref, { once: VIEWPORT.once, amount: VIEWPORT.amount, margin: VIEWPORT.margin });
  const to = { scaleX: shown, transition: { duration: DUR.slower, ease: EASE_OUT, delay } };
  return (
    <div
      ref={ref}
      role={label ? "meter" : undefined}
      aria-label={label}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-valuenow={label ? Math.round(v * 100) : undefined}
      className={cn("relative h-1 overflow-hidden bg-border", className)}
    >
      <motion.div
        aria-hidden="true"
        className={cn("absolute inset-0 origin-left bg-primary", fillClassName)}
        initial={{ scaleX: 0 }}
        animate={!HAS_IO || seen ? to : { scaleX: 0 }}
      />
    </div>
  );
}
