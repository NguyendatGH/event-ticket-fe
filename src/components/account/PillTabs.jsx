import { useEffect, useId, useRef } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { LayoutGroup } from "motion/react";
import { TabIndicator } from "@/components/motion";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Tab dạng pill (design-spec v2): pill đang chọn nền xanh chữ tối, nền xanh trượt sang pill mới (layoutId).
 * Là WAI-ARIA tabs thật (Radix): mũi tên trái/phải chuyển tab, nội dung nằm trong tabpanel.
 *
 *   <PillTabs label="Lọc vé" value={scope} onValueChange={setScope}
 *     items={[{ value: "upcoming", label: "Sắp diễn ra", count: 12, countLabel: "vé" }, …]}>
 *     {danh sách}
 *   </PillTabs>
 *
 * Props: label (aria-label của tablist), value, onValueChange, items [{ value, label, count?, countLabel? }]
 * (count null/undefined → không hiện số), children (nội dung tab đang chọn), className.
 * Mobile: hàng pill cuộn ngang; pill đang chọn tự cuộn vào tầm nhìn (vd mở thẳng /me/orders?status=cancelled), chỉ cuộn ngang.
 */
export function PillTabs({ label, value, onValueChange, items, children, className }) {
  const id = useId();
  const listRef = useRef(null);
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[data-state="active"]');
    if (!list || !el || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2;
  }, [value]);
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      <LayoutGroup id={id}>
        <TabsPrimitive.List ref={listRef} aria-label={label} className="relative -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1 no-scrollbar md:mb-6">
          {items.map((item) => {
            const active = item.value === value;
            return (
              <TabsPrimitive.Trigger
                key={item.value}
                value={item.value}
                className={cn(
                  "relative isolate inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active ? "text-primary-foreground" : "bg-card text-secondary-foreground ring-1 ring-white/8 hover:bg-elevated hover:text-foreground"
                )}
              >
                {item.label}
                {item.count != null ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs leading-5 font-semibold tabular-nums",
                      active ? "bg-black/15 text-primary-foreground" : "bg-white/8 text-muted-foreground"
                    )}
                  >
                    {formatNumber(item.count)}
                    {item.countLabel ? <span className="sr-only"> {item.countLabel}</span> : null}
                  </span>
                ) : null}
                {active ? <TabIndicator id="pill-tabs" variant="pill" className="rounded-full bg-primary" /> : null}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </LayoutGroup>
      <TabsPrimitive.Content value={value} className="outline-none">
        {children}
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
}
