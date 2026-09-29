// Chân trang auth: divider + câu hỏi + link.

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { riseSm } from "@/lib/motion";

export function AuthFooter({ prompt, children, ...linkProps }) {
  return (
    <motion.p variants={riseSm} className="border-t border-border pt-6 text-sm text-muted-foreground">
      {prompt}{" "}
      <Link className="font-medium link-accent" {...linkProps}>
        {children}
      </Link>
    </motion.p>
  );
}
