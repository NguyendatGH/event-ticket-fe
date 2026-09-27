import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ImageWithFallback } from "@/components/site";
import { imageSettle } from "@/lib/motion";

/**
 * Ảnh bìa đầu trang chi tiết: lắng xuống khi mount, trôi chậm hơn trang khi cuộn (tối đa 60px),
 * mờ dần vào nền trang ở mép dưới (lớp gradient ::after). Bật "giảm chuyển động" thì không trôi.
 */
export function EventCover({ event }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60]);
  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-surface after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-3/5 after:bg-gradient-to-t after:from-background after:via-background/60 after:to-transparent"
    >
      <motion.div style={{ y }}>
        <motion.div variants={imageSettle} initial="hidden" animate="show">
          <ImageWithFallback
            src={event.coverImageUrl}
            alt={event.coverImageAlt || event.name}
            priority
            className="h-[clamp(260px,46vw,620px)] w-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
