import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, href, linkLabel = "Xem tất cả", description, size = "label", as: Tag = "h2", className, children }) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-6 border-b border-border pb-4", className)}>
      <div className="min-w-0 space-y-2">
        <Tag className={size === "title" ? "text-h2 text-foreground" : "heading-caps"}>{title}</Tag>
        {description ? <p className="max-w-[60ch] text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
      {href ? (
        <Link to={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium link-quiet">
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
