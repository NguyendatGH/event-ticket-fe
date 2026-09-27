import { cn } from "@/lib/utils";

/** Màu vạch + chữ theo mức độ thông báo. */
const TONE = {
  danger: "border-destructive text-destructive",
  warning: "border-warning text-warning",
  info: "border-info text-info",
  success: "border-primary text-primary",
  neutral: "border-border-hover text-foreground",
};

/**
 * Thông báo trong trang: vạch màu 2px bên trái + chữ, không khung, không nền.
 *   <Notice tone="warning" title="Đơn đang chờ thanh toán">Mô tả thêm…</Notice>
 * tone "danger" tự có role="alert" để trình đọc màn hình đọc ngay; các tone khác là "status".
 */
export function Notice({ tone = "neutral", title, children, className, role }) {
  return (
    <div role={role ?? (tone === "danger" ? "alert" : "status")} className={cn("border-l-2 py-1 pl-4", TONE[tone], className)}>
      {title ? <p className="text-ui font-medium">{title}</p> : null}
      {children ? <div className={cn("text-sm leading-relaxed text-secondary-foreground", title && "mt-1")}>{children}</div> : null}
    </div>
  );
}
