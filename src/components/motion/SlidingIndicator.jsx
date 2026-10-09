import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SlidingIndicator({ containerRef, activeKey, axis = "x", className }) {
  const [box, setBox] = useState(null);
  useEffect(() => {
    const nav = containerRef.current;
    if (!nav) return undefined;
    const measure = () => {
      const el = nav.querySelector('[aria-current="page"]');
      setBox(el ? (axis === "x" ? { pos: el.offsetLeft, size: el.offsetWidth } : { pos: el.offsetTop, size: el.offsetHeight }) : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [containerRef, activeKey, axis]);

  if (!box || !box.size) return null;
  const anim = axis === "x" ? { x: box.pos, scaleX: box.size } : { y: box.pos, scaleY: box.size };
  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={anim}
      transition={SPRING.indicator}
      className={cn(
        "pointer-events-none absolute bg-primary",
        axis === "x" ? "-bottom-px left-0 h-0.5 w-px origin-left" : "top-0 left-0 h-px w-0.5 origin-top",
        className
      )}
    />
  );
}
