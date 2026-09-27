import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { DIST, DUR, EASE_OUT } from "@/lib/motion";

/**
 * Chuyển trang: chỉ có enter (fade + nhích y), key theo pathname.
 * Đổi search params (?q, ?category, ?step) không chạy lại. Không exit/AnimatePresence
 * để không chặn điều hướng và không đánh nhau với ScrollRestoration.
 * Bỏ qua 1 lần: navigate(to, { state: { noTransition: true } }).
 */
export function PageTransition({ children, y = DIST.sm, className }) {
  const { pathname, state } = useLocation();
  const reduce = useReducedMotion();
  const skip = reduce || state?.noTransition;
  return (
    <motion.div
      key={pathname}
      initial={skip ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
