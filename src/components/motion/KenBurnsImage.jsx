import { motion, useReducedMotion } from "motion/react";
import { ImageWithFallback } from "@/components/site/ImageWithFallback";
import { DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Ảnh hero trôi chậm 1 → 1.06 (Ken Burns). Chỉ MỘT chỗ mỗi trang (hero home, scene auth).
 * duration: giây, nên = thời gian mỗi slide + 1 để không dừng giữa chừng. Tắt khi reduced-motion.
 * Đặt trong khung `relative overflow-hidden`.
 */
export function KenBurnsImage({ src, alt, priority, active = true, duration = DUR.drift, className, imgClassName }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("absolute inset-0 will-change-transform", className)}
      initial={{ scale: 1 }}
      animate={reduce || !active ? { scale: 1 } : { scale: 1.06 }}
      transition={{ duration, ease: "linear" }}
    >
      <ImageWithFallback src={src} alt={alt} priority={priority} className={cn("size-full", imgClassName)} />
    </motion.div>
  );
}
