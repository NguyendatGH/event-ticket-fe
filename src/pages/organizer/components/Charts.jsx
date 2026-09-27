/**
 * Biểu đồ của trang tổng quan (DashboardPage), vẽ bằng recharts:
 *   RevenueChart  doanh thu theo thời gian (vùng + đường)
 *   TicketsChart  vé bán theo thời gian (cột)
 */
import { memo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE_INOUT, HAS_IO, VIEWPORT } from "@/lib/motion";
import { formatCompactVND, formatNumber, formatVND } from "@/lib/format";
import { formatBucketLabel, formatBucketTick } from "../lib/helpers";

/* Màu SVG trỏ thẳng vào token trong index.css (thuộc tính fill/stroke nhận var()), không lặp mã hex. */
const C = {
  green: "var(--green)",
  grid: "var(--elevated)",
  axis: "var(--text-muted)",
  cursor: "var(--line-hover)",
  bg: "var(--bg)",
  hover: "var(--green-bright)",
};

/**
 * Biểu đồ "vẽ" từ trái sang phải lần đầu vào màn hình: một lớp nền trượt đi (transform, không đụng SVG của recharts).
 * `left` chừa trục Y đứng yên. Đổi kỳ/gộp theo không wipe lại (chỉ mờ placeholder ở ChartBlock).
 */
function ChartReveal({ left, children }) {
  const reduce = useReducedMotion();
  const to = { scaleX: 0, transition: { duration: DUR.slower + 0.1, ease: EASE_INOUT, delay: 0.1 } };
  return (
    <div className="relative">
      {children}
      {reduce ? null : (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 origin-right bg-background"
          style={{ left }}
          initial={{ scaleX: 1 }}
          {...(HAS_IO ? { whileInView: to, viewport: VIEWPORT } : { animate: to })}
        />
      )}
    </div>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: C.axis, fontSize: 12 },
};

/** Tooltip tối, viền 1px, radius 4px. */
function ChartTooltip({ active, payload, label, interval, kind }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md border border-border bg-elevated px-3 py-2">
      <p className="text-xs text-muted-foreground">{formatBucketLabel(label, interval)}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{kind === "money" ? formatVND(value) : `${formatNumber(value)} vé`}</p>
      {kind !== "money" && payload[0].payload?.orders != null ? (
        <p className="text-xs text-muted-foreground tabular-nums">{formatNumber(payload[0].payload.orders)} đơn</p>
      ) : null}
    </div>
  );
}

/** Khoảng cách tối thiểu (px) giữa 2 nhãn trục X: càng nhiều điểm dữ liệu thì nhãn càng thưa, để không chồng chữ. */
function tickGap(pointCount) {
  if (pointCount > 60) return 32;
  if (pointCount > 20) return 24;
  return 12;
}

/**
 * Doanh thu theo thời gian: vùng xanh mờ dần xuống đáy + đường 2px.
 * Theo ngày: đường thẳng (linear) để các ngày 0đ không bị vẽ thành "gò" giả; tuần/tháng: monotoneX (không vọt quá dữ liệu).
 */
// memo: trang render lại khi query khác xong (URL, summary…) thì biểu đồ bỏ qua nếu data/interval không đổi.
export const RevenueChart = memo(function RevenueChart({ data, interval, height = 280 }) {
  const yWidth = 56;
  return (
    <ChartReveal left={yWidth}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* right 20: nhãn ngày cuối nằm ngay mép phải, chừa đủ nửa nhãn để không bị cắt ("27.0…") */}
          <AreaChart data={data} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="org-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="date" {...axisProps} minTickGap={tickGap(data.length)} tickFormatter={(d) => formatBucketTick(d, interval)} dy={8} />
            <YAxis {...axisProps} width={yWidth} tickFormatter={(v) => (v === 0 ? "0" : formatCompactVND(v))} allowDecimals={false} />
            <Tooltip cursor={{ stroke: C.cursor, strokeWidth: 1 }} content={<ChartTooltip interval={interval} kind="money" />} isAnimationActive={false} />
            <Area
              type={interval === "day" ? "linear" : "monotoneX"}
              dataKey="revenue"
              name="Doanh thu"
              stroke={C.green}
              strokeWidth={2}
              fill="url(#org-revenue-fill)"
              dot={false}
              activeDot={{ r: 4, fill: C.bg, stroke: C.green, strokeWidth: 2 }}
              // Animation của recharts (stroke-dasharray) dễ kẹt nửa chừng khi đổi kỳ: tắt, dùng ChartReveal.
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
});

/** Vé bán theo thời gian: cột bo 2px; rê chuột vào một cột thì các cột khác lùi về 55%. */
export const TicketsChart = memo(function TicketsChart({ data, interval, height = 240 }) {
  const [active, setActive] = useState(null);
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="20%" onMouseMove={(st) => setActive(st?.isTooltipActive ? st.activeTooltipIndex : null)} onMouseLeave={() => setActive(null)}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="date" {...axisProps} minTickGap={tickGap(data.length)} tickFormatter={(d) => formatBucketTick(d, interval)} dy={8} />
          <YAxis {...axisProps} width={36} allowDecimals={false} tickFormatter={(v) => formatNumber(v)} />
          <Tooltip cursor={{ fill: "rgba(245,247,246,0.04)" }} content={<ChartTooltip interval={interval} kind="count" />} isAnimationActive={false} />
          <Bar dataKey="tickets" name="Vé bán" fill={C.green} radius={[2, 2, 0, 0]} maxBarSize={28} animationDuration={450} animationBegin={150} animationEasing="ease-out">
            {data.map((d, i) => (
              <Cell key={d.date} fill={active === i ? C.hover : C.green} fillOpacity={active == null || active === i ? 1 : 0.55} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
