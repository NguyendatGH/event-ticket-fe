import { motion } from "motion/react";
import { fadeUp, inView as reveal } from "@/lib/motion";

/**
 * Một khối nội dung của trang chi tiết (Giới thiệu, Lịch trình, Địa điểm, Ban tổ chức):
 * tiêu đề nhỏ bên trái, nội dung bên phải, divider phía trên; hiện dần khi cuộn tới.
 */
export function DetailBlock({ title, children, id }) {
  return (
    <motion.section
      {...reveal}
      variants={fadeUp}
      aria-labelledby={id}
      className="grid gap-4 border-t border-border py-10 md:grid-cols-[180px_1fr] md:gap-8"
    >
      <h2 id={id} className="eyebrow pt-1 text-secondary-foreground">
        {title}
      </h2>
      <div className="min-w-0">{children}</div>
    </motion.section>
  );
}
