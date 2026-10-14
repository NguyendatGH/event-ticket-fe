import { motion } from "motion/react";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
