import { AnimatePresence, motion } from "motion/react";
import { rowItem, SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Danh sách có thêm/xóa/sắp xếp: dòng mới trượt vào, dòng bị xóa rời đi, các dòng còn lại dồn khe bằng transform.
 *   <AnimatedList className="divide-y">
 *     {items.map((t, i) => <AnimatedItem key={t.id} index={i % PAGE_SIZE}>…</AnimatedItem>)}
 *   </AnimatedList>
 * Key phải là id ổn định (không dùng index). Chỉ dùng cho list thực sự đổi phần tử.
 */
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

/** index: vị trí trong trang vừa tải (i % pageSize) → chỉ batch mới stagger. */
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
