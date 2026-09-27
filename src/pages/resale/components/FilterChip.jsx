import { motion } from "motion/react";
import { X } from "lucide-react";
import { DUR, EASE_OUT } from "@/lib/motion";

/**
 * Chip "bộ lọc đang áp dụng" có nút ✕ để bỏ lọc. Đặt trong <AnimatePresence mode="popLayout">:
 * `layout` cho các chip còn lại trượt vào chỗ trống, `exit` cho chip bị bỏ mờ dần.
 */
export function FilterChip({ children, onRemove, label }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: DUR.fast } }}
      transition={{ duration: DUR.base, ease: EASE_OUT }}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border pr-1.5 pl-3 text-meta text-secondary-foreground">
      <span className="max-w-60 truncate">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={label}
        className="focus-ring grid size-5 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </motion.span>
  );
}
