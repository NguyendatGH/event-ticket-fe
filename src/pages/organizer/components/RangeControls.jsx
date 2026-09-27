import { useId, useState } from "react";
import { LayoutGroup } from "motion/react";
import { TabIndicator } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DASHBOARD_INTERVALS } from "@/lib/constants";
import { todayISODate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RANGE_PRESETS } from "../lib/helpers";

/**
 * Bộ chọn khoảng thời gian của trang tổng quan: 7/30/90 ngày + tùy chọn (from/to), gộp theo ngày/tuần/tháng.
 * Mọi thứ nằm trên URL; component chỉ gọi onChange(patch). Ô ngày tự chọn giữ bản nháp (`draft`) tới khi bấm
 * "Áp dụng" (trang cha đặt `key` theo khoảng đang chọn nên bản nháp tự reset khi URL đổi).
 * Mỗi nhóm nút bọc LayoutGroup riêng để vạch chọn (TabIndicator) chỉ trượt trong nhóm của nó.
 */
export function RangeControls({ range, from, to, interval, invalid, onChange }) {
  const [draft, setDraft] = useState({ from, to });
  const today = todayISODate();
  const rangeGroup = useId();
  const intervalGroup = useId();
  const tab = (active) =>
    cn(
      "relative -mb-px cursor-pointer pb-2.5 text-sm font-medium transition-colors focus-ring",
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    );
  return (
    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <LayoutGroup id={rangeGroup}>
          <div role="group" aria-label="Khoảng thời gian" className="flex gap-6 border-b border-border">
            {RANGE_PRESETS.map((p) => (
              <button key={p.value} type="button" aria-pressed={range === p.value} className={tab(range === p.value)} onClick={() => onChange({ range: p.value, from: null, to: null })}>
                {p.label}
                {range === p.value ? <TabIndicator id="dash-range" /> : null}
              </button>
            ))}
            <button type="button" aria-pressed={range === "custom"} className={tab(range === "custom")} onClick={() => onChange({ range: "custom", from, to })}>
              Tùy chọn
              {range === "custom" ? <TabIndicator id="dash-range" /> : null}
            </button>
          </div>
        </LayoutGroup>
        {range === "custom" ? (
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onChange({ range: "custom", from: draft.from, to: draft.to });
            }}
          >
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Từ ngày
              <Input type="date" value={draft.from} max={draft.to || today} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} className="h-9 w-38 tabular-nums" />
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Đến ngày
              <Input type="date" value={draft.to} min={draft.from} max={today} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} className="h-9 w-38 tabular-nums" />
            </label>
            <Button type="submit" size="sm" variant="secondary" className="h-9">
              Áp dụng
            </Button>
            {invalid ? <p className="w-full text-xs text-destructive">Khoảng ngày không hợp lệ (tối đa 366 ngày, ngày bắt đầu trước ngày kết thúc).</p> : null}
          </form>
        ) : null}
      </div>
      <LayoutGroup id={intervalGroup}>
        <div role="group" aria-label="Gộp theo" className="isolate flex items-center gap-1 self-start lg:self-auto">
          <span className="mr-2 text-xs text-muted-foreground">Gộp theo</span>
          {DASHBOARD_INTERVALS.map((it) => (
            <button
              key={it.value}
              type="button"
              aria-pressed={interval === it.value}
              onClick={() => onChange({ interval: it.value })}
              className={cn(
                "relative z-0 h-8 cursor-pointer rounded-sm px-3 text-meta font-medium transition-colors focus-ring",
                interval === it.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {it.label}
              {interval === it.value ? <TabIndicator id="dash-interval" variant="pill" /> : null}
            </button>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
