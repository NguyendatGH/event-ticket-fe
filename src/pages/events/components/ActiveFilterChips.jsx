import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

const chipMotion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export function ActiveFilterChips({ chips, onRemove }) {
  return (
    <ul
      className="flex flex-wrap gap-2 pt-4"
      aria-label="Bộ lọc đang áp dụng"
    >
      <AnimatePresence initial={false}>
        {chips.map((c) => (
          <motion.li key={c.key} layout {...chipMotion}>
            <button
              type="button"
              onClick={() => onRemove(c.patch)}
              className="focus-ring inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-sm border border-border px-2.5 text-meta text-secondary-foreground transition-colors hover:border-border-hover hover:text-foreground"
            >
              {c.label}
              <X className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Bỏ bộ lọc</span>
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
