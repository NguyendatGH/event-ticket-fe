// Số rất lớn (≥ 10 tỷ): from={value * 0.85} cho gọn.

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { DUR, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const IS_TEST = import.meta.env.MODE === "test";

export function AnimatedNumber({ value = 0, from = 0, format = String, duration = DUR.count, className }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce || IS_TEST ? value : from);
  const text = useTransform(mv, (v) => format(Math.round(v)));

  useEffect(() => {
    if (reduce || IS_TEST) {
      mv.set(value);
      return undefined;
    }
    if (!seen) return undefined;
    const controls = animate(mv, value, { duration, ease: EASE_OUT });
    return () => controls.stop();
  }, [seen, value, reduce, duration, mv]);

  if (IS_TEST) return <span className={cn("tabular-nums", className)}>{format(value)}</span>;
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span className="sr-only">{format(value)}</span>
      <motion.span aria-hidden="true">{text}</motion.span>
    </span>
  );
}
