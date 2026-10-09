import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-price",
};

export function Price({ value, from = false, size = "md", className, tone = "accent" }) {
  if (value == null) return null;
  const amount = Number(value) === 0 ? "Miễn phí" : formatVND(value);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 tabular-nums", SIZE[size], className)}>
      {from && Number(value) > 0 ? <span className="text-[0.875em] font-normal text-muted-foreground">Từ</span> : null}
      <span className={cn("font-semibold", tone === "accent" ? "text-primary" : "text-foreground")}>{amount}</span>
    </span>
  );
}
