// Khác SectionHeader (v1): không kẻ viền dưới.

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionTitle({ icon: Icon, iconClassName, title, href, linkLabel = "Xem thêm", as: Tag = "h2", id, description, className, children }) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4 md:mb-5", className)}>
      <div className="min-w-0">
        <Tag id={id} className="flex items-center gap-2 text-lg leading-tight font-bold text-foreground md:text-xl">
          {Icon ? <Icon className={cn("size-5 shrink-0 md:size-6", iconClassName ?? "text-primary")} aria-hidden="true" /> : null}
          <span className="min-w-0">{title}</span>
        </Tag>
        {description ? <p className="mt-1.5 max-w-[60ch] text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
      {href ? (
        <Link
          to={href}
          className="inline-flex shrink-0 items-center gap-0.5 rounded-sm text-sm text-muted-foreground transition-colors arrow-nudge hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
