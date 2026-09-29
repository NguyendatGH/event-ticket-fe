// Thông báo trong trang: vạch màu bên trái, không khung, không nền.

import { cn } from "@/lib/utils";

const TONE = {
  danger: "border-destructive text-destructive",
  warning: "border-warning text-warning",
  info: "border-info text-info",
  success: "border-primary text-primary",
  neutral: "border-border-hover text-foreground",
};

export function Notice({ tone = "neutral", title, children, className, role }) {
  return (
    <div role={role ?? (tone === "danger" ? "alert" : "status")} className={cn("border-l-2 py-1 pl-4", TONE[tone], className)}>
      {title ? <p className="text-ui font-medium">{title}</p> : null}
      {children ? <div className={cn("text-sm leading-relaxed text-secondary-foreground", title && "mt-1")}>{children}</div> : null}
    </div>
  );
}
