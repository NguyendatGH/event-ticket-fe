import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";

const roll = {
  enter: (d) => ({ y: d * 8, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d) => ({ y: d * -8, opacity: 0 }),
};
const STEP_BTN =
  "grid size-9 cursor-pointer place-items-center rounded-sm border border-border text-foreground transition hover:border-border-hover hover:bg-surface active:scale-95 focus-ring disabled:cursor-not-allowed disabled:border-border/50 disabled:opacity-40 disabled:hover:bg-transparent";

export function QuantityStepper({ tier, value, max, disabled, onChange }) {
  const [dir, setDir] = useState(1);
  const step = (d) => {
    setDir(d);
    onChange(value + d);
  };
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={`Số lượng vé ${tier.name}`}
    >
      <button
        type="button"
        className={STEP_BTN}
        disabled={disabled || value <= 0}
        onClick={() => step(-1)}
        aria-label={`Bớt một vé ${tier.name}`}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className="relative grid size-9 place-items-center overflow-hidden text-sm font-medium tabular-nums"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.span
            key={value}
            custom={dir}
            variants={roll}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </output>
      <button
        type="button"
        className={STEP_BTN}
        disabled={disabled || value >= max}
        onClick={() => step(1)}
        aria-label={`Thêm một vé ${tier.name}`}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
