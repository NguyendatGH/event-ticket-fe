import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Dấu tick thanh toán xong: vòng tròn tự vẽ → dấu tick → một vòng lan tỏa duy nhất (không lặp, không confetti). */
export function SuccessMark({ size = 56, className }) {
  const reduce = useReducedMotion();
  const draw = (delay) => ({
    initial: { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration: 0.5, ease: EASE_OUT, delay }, opacity: { duration: 0.01, delay } },
  });
  return (
    <span className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} aria-hidden="true">
      {!reduce ? (
        <motion.span
          className="absolute inset-0 rounded-full border border-primary"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.55 }}
        />
      ) : null}
      <svg viewBox="0 0 56 56" width={size} height={size} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.circle cx="28" cy="28" r="26" {...draw(0)} />
        <motion.path d="M17 29l7 7 15-16" strokeWidth="2" {...draw(0.35)} />
      </svg>
    </span>
  );
}
