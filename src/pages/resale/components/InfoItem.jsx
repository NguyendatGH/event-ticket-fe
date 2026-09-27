import { cn } from "@/lib/utils";

/**
 * Icon + tiêu đề + đoạn giải thích (cam kết ở marketplace, cảnh báo trên trang đăng bán).
 * tone: màu icon; className: khung ngoài (vd vạch trái "border-l-2 border-warning pl-4").
 */
export function InfoItem({ icon: Icon, tone = "text-primary", title, children, className }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <Icon className={cn("mt-0.5 size-4.5 shrink-0", tone)} aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
