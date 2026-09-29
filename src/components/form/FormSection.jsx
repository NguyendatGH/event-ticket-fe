// Nhóm field có nhãn nhỏ và divider.

import { motion } from "motion/react";
import { riseSm } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function FormSection({ title, description, children, className }) {
  return (
    <fieldset className={cn("space-y-6 border-t border-border pt-8", className)}>
      <legend className="sr-only">{title}</legend>
      <motion.div variants={riseSm} className="space-y-1.5" aria-hidden="true">
        <p className="eyebrow text-secondary-foreground">{title}</p>
        {description ? <p className="text-meta text-muted-foreground">{description}</p> : null}
      </motion.div>
      {children}
    </fieldset>
  );
}
