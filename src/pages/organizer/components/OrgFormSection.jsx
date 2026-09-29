// Khác `FormSection` của @/components/form (auth/account: nhãn nhỏ + divider, xếp dọc).

import { cn } from "@/lib/utils";

export function OrgFormSection({ title, description, children, className }) {
  return (
    <section className={cn("grid gap-6 border-t border-border py-8 first:border-t-0 first:pt-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[200px_minmax(0,1fr)]", className)}>
      <div className="space-y-1.5">
        <h3 className="text-ui font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-meta leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid min-w-0 content-start gap-6">{children}</div>
    </section>
  );
}
