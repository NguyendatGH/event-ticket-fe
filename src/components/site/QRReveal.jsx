import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE_INOUT, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function QRReveal({ live = true, delay = 0.25, className, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("relative inline-block overflow-hidden", className)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: DUR.slow, ease: EASE_OUT, delay: delay * 0.4 }}
    >
      {children}
      {live && !reduce ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ y: "0%", opacity: 0 }}
          animate={{ y: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, ease: EASE_INOUT, delay }}
        >
          <span className="absolute inset-x-0 -top-8 h-8 border-b border-primary bg-linear-to-t from-primary/25 to-transparent" />
        </motion.span>
      ) : null}
    </motion.div>
  );
}
