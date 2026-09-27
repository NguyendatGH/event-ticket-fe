import { motion } from "motion/react";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Gạch chân trượt theo layoutId cho danh sách tab trong luồng trang (không sticky).
 * Render CHỈ trong item đang chọn; item phải `relative`. Mỗi danh sách bọc <LayoutGroup id={useId()}>
 * để các instance không giành layoutId của nhau. Danh sách cuộn ngang: motion.ul + layoutScroll.
 *   variant "line": vạch 2px dưới đáy. "pill": nền trượt phía sau chữ (segmented control).
 */
export function TabIndicator({ id = "tab-indicator", variant = "line", className }) {
  return (
    <motion.span
      layoutId={id}
      transition={SPRING.indicator}
      aria-hidden="true"
      className={cn(
        variant === "pill" ? "absolute inset-0 -z-10 rounded-sm bg-elevated" : "absolute inset-x-0 -bottom-px h-0.5 bg-primary",
        className
      )}
    />
  );
}
