// Trạng thái rỗng: không khung, chỉ chữ và khoảng trắng.

import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-16 text-center md:py-20", className)}>
      {Icon ? <Icon className="mb-5 size-5.5 text-muted-foreground" aria-hidden="true" /> : null}
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
