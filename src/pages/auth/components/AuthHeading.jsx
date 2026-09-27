import { motion } from "motion/react";
import { riseSm } from "@/lib/motion";

/** Tiêu đề màn auth: H1 + mô tả ngắn. Là item đầu tiên của stagger trong trang. */
export function AuthHeading({ title, description, eyebrow }) {
  return (
    <motion.div variants={riseSm} className="space-y-3">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="text-h2 tracking-[-0.025em] text-foreground">{title}</h1>
      {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </motion.div>
  );
}
