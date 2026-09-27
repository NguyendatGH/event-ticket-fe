import { cn } from "@/lib/utils";

/**
 * Danh sách nhãn/giá trị với divider (thay cho card):
 *   NGÀY        24.10.2026
 *   ─────────────────────────
 *   ĐỊA ĐIỂM    Mỹ Đình, Hà Nội
 * items: [{ label, value }] (value rỗng bị bỏ qua).
 */
export function KeyValueList({ items = [], className, labelWidth = "sm:grid-cols-[180px_1fr]" }) {
  const rows = items.filter((i) => i && i.value != null && i.value !== "" && i.value !== false);
  return (
    <dl className={cn("border-t border-border", className)}>
      {rows.map(({ label, value }, i) => (
        <div key={typeof label === "string" ? label : i} className={cn("grid gap-1 border-b border-border py-3.5 sm:gap-6", labelWidth)}>
          <dt className="eyebrow pt-0.5">{label}</dt>
          <dd className="text-sm text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
