// Hiện sau 150ms (tải nhanh không nháy), chạy tới 80% rồi chờ; unmount khi trang sẵn sàng.

import { motion } from "motion/react";

export function NavProgress() {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-60 h-0.5 origin-left bg-primary"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 0.8, opacity: 1 }}
      transition={{ scaleX: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }, opacity: { duration: 0.1, delay: 0.15 } }}
    />
  );
}
