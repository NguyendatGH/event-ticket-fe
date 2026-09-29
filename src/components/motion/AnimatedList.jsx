// Key phải là id ổn định (không dùng index). Chỉ dùng cho list thực sự đổi phần tử (thêm/xóa/sắp xếp).

import { AnimatePresence, motion } from "motion/react";
import { rowItem, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AnimatedList({ as = "ul", className, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag className={cn("relative", className)} {...rest}>
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </Tag>
  );
}

export function AnimatedItem({ as = "li", index = 0, className, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      layout="position"
      initial={rowItem.initial}
      animate={{ ...rowItem.animate, transition: { ...rowItem.animate.transition, delay: Math.min(index, 9) * 0.035, layout: SPRING.layout } }}
      exit={rowItem.exit}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
