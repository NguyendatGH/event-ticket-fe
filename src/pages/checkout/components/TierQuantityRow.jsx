// Một hạng vé dạng dòng, có nút −/+ và vạch xanh khi đang chọn.

import { memo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { tierLimit } from "@/lib/business";
import { formatVND } from "@/lib/format";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const TierQuantityRow = memo(function TierQuantityRow({ tier, quantity = 0, onChange, disabled }) {
  const limit = tierLimit(tier);
  const soldOut = limit === 0;
  const selected = quantity > 0;
  const set = (q) => onChange(tier.id, Math.max(0, Math.min(limit, q)));
  const [last, setLast] = useState(quantity);
  const [dir, setDir] = useState(1);
  if (quantity !== last) {
    setDir(quantity > last ? 1 : -1);
    setLast(quantity);
  }

  return (
    <li
      className={cn(
        "relative grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-border py-5 pr-1 pl-5 transition-colors",
        selected && "bg-surface/40",
        soldOut && "opacity-60"
      )}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 origin-top bg-primary"
        initial={false}
        animate={{ scaleY: selected ? 1 : 0 }}
        transition={{ duration: DUR.moderate, ease: EASE_OUT }}
      />
      <div className="min-w-0">
        <p className="text-title font-semibold text-foreground">{tier.name}</p>
        {tier.description ? <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p> : null}
        <p className="mt-2 text-sm text-secondary-foreground tabular-nums">
          <span className={cn("font-semibold", soldOut ? "text-muted-foreground" : "text-primary")}>{formatVND(tier.price)}</span>
          {soldOut ? (
            <span className="eyebrow ml-3">Hết vé</span>
          ) : tier.available <= 20 ? (
            <span className="ml-3 text-muted-foreground">Còn {tier.available} vé</span>
          ) : null}
        </p>
      </div>

      {soldOut ? null : (
        <div className="flex items-center" role="group" aria-label={`Số lượng vé ${tier.name}`}>
          <button
            type="button"
            onClick={() => set(quantity - 1)}
            disabled={disabled || quantity <= 0}
            aria-label={`Bớt một vé ${tier.name}`}
            className={STEP_BTN}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <output className="relative grid h-9 w-10 place-items-center overflow-hidden text-ui font-medium text-foreground tabular-nums" aria-live="polite">
            <AnimatePresence initial={false} mode="popLayout" custom={dir}>
              <motion.span
                key={quantity}
                custom={dir}
                variants={ROLL}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18, ease: EASE_OUT }}
              >
                {quantity}
              </motion.span>
            </AnimatePresence>
          </output>
          <button
            type="button"
            onClick={() => set(quantity + 1)}
            disabled={disabled || quantity >= limit}
            aria-label={`Thêm một vé ${tier.name}`}
            className={STEP_BTN}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {selected && quantity >= limit && !soldOut ? (
        <p className="col-span-2 -mt-1 text-caption text-muted-foreground">
          {limit < Number(tier.maxPerOrder ?? Infinity) ? `Chỉ còn ${limit} vé hạng này.` : `Tối đa ${limit} vé mỗi đơn cho hạng này.`}
        </p>
      ) : null}
    </li>
  );
});

const STEP_BTN =
  "focus-ring grid size-9 cursor-pointer place-items-center rounded-md border border-border text-foreground transition hover:border-border-hover hover:bg-surface active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

const ROLL = {
  enter: (d) => ({ y: d * 8, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d) => ({ y: d * -8, opacity: 0 }),
};
