/**
 * Trang tổng quan của ban tổ chức — route /organizer?range=7|30|90|custom&from=&to=&interval=day|week|month
 * Số liệu tổng, biểu đồ doanh thu + vé bán, sự kiện theo trạng thái, sự kiện bán chạy.
 * Khoảng thời gian nằm trên URL (đọc bằng resolveRange trong ./lib/helpers.js).
 * Dữ liệu: useDashboardSummary, useDashboardSales, useDashboardRevenue, useDashboardTopEvents
 * (4 query chạy song song, cùng tham số from/to/interval).
 */
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { useDashboardRevenue, useDashboardSales, useDashboardSummary, useDashboardTopEvents } from "@/api";
import { EmptyState, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatNumber, formatPercentChange, formatVND } from "@/lib/format";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ChartBlock, SrTable } from "./components/ChartBlock";
import { RevenueChart, TicketsChart } from "./components/Charts";
import { EventStatusSummary } from "./components/EventStatusSummary";
import { BlockTitle, OrgHeader, StatStrip, StatStripSkeleton } from "./components/OrgUi";
import { RangeControls } from "./components/RangeControls";
import { TopEvents } from "./components/TopEvents";
import { formatRangeLabel, resolveRange } from "./lib/helpers";

// Mảng rỗng cố định: `data ?? NONE` không tạo mảng mới mỗi render (biểu đồ memo không bị phá).
const NONE = [];

/** Dòng phụ dưới mỗi số: "+12,4% so với kỳ trước", màu + mũi tên theo chiều tăng/giảm. */
function vsPreviousPeriod(metric) {
  const pct = metric?.changePct;
  if (pct == null) return { sub: metric?.previous ? null : "Chưa có dữ liệu kỳ trước", toneClass: "text-disabled-foreground" };

  const sub = `${formatPercentChange(pct)} so với kỳ trước`;
  if (pct > 0) return { sub, toneClass: "text-primary", trend: "up" };
  if (pct < 0) return { sub, toneClass: "text-destructive", trend: "down" };
  return { sub, toneClass: "text-muted-foreground", trend: undefined };
}

export default function DashboardPage() {
  useDocumentTitle("Tổng quan");
  const [params, setParams] = useSearchParams();
  const { range, from, to, interval, invalid } = resolveRange(params);
  const apiParams = invalid ? { interval } : { from, to, interval };

  const summary = useDashboardSummary(apiParams);
  const sales = useDashboardSales(apiParams);
  const revenue = useDashboardRevenue(apiParams);
  const top = useDashboardTopEvents({ ...apiParams, limit: 5 });

  /** Ghi thay đổi lên URL; giá trị mặc định (30 ngày, gộp theo ngày) thì xóa khỏi URL cho gọn. */
  const update = (patch) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        Object.entries(patch).forEach(([k, val]) => (val == null || val === "" ? next.delete(k) : next.set(k, val)));
        if (next.get("range") === "30") next.delete("range");
        if (next.get("interval") === "day") next.delete("interval");
        return next;
      },
      { preventScrollReset: true }
    );

  const s = summary.data;
  const isNew = s && s.events?.total === 0;

  let content;
  if (summary.isError) {
    content = <ErrorState error={summary.error} onRetry={summary.refetch} />;
  } else if (summary.isPending) {
    content = <DashboardSkeleton />;
  } else if (isNew) {
    content = (
      <EmptyState
        title="Chưa có sự kiện nào"
        description="Tạo sự kiện đầu tiên, thêm hạng vé và xuất bản. Doanh thu và vé bán sẽ hiện ở đây ngay khi có đơn thanh toán."
        action={
          <Button asChild size="lg">
            <Link to="/organizer/events/new">
              <Plus aria-hidden="true" />
              Tạo sự kiện đầu tiên
            </Link>
          </Button>
        }
      />
    );
  } else {
    content = (
      <motion.div variants={stagger} initial="hidden" animate="show" className={cn("transition-opacity", summary.isPlaceholderData && "opacity-70")}>
        <motion.div variants={fadeUp}>
          <StatStrip
            items={[
              { label: "Doanh thu", value: { n: s.revenue?.value ?? 0, format: formatVND }, ...vsPreviousPeriod(s.revenue) },
              { label: "Vé đã bán", value: { n: s.ticketsSold?.value ?? 0, format: formatNumber }, ...vsPreviousPeriod(s.ticketsSold) },
              { label: "Đơn thanh toán", value: { n: s.orders?.value ?? 0, format: formatNumber }, ...vsPreviousPeriod(s.orders) },
              {
                label: "Sự kiện",
                value: { n: s.events?.total ?? 0, format: formatNumber },
                sub: `${formatNumber((s.events?.published ?? 0) + (s.events?.upcoming ?? 0))} đang mở, ${formatNumber(s.events?.draft ?? 0)} bản nháp`,
              },
            ]}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12">
          <ChartBlock title="Doanh thu" size="h-70" total={revenue.data ? formatVND(revenue.data.reduce((a, r) => a + (r.revenue || 0), 0)) : null} query={revenue}>
            <RevenueChart data={revenue.data ?? NONE} interval={interval} />
            <SrTable caption="Doanh thu theo thời gian" rows={revenue.data ?? NONE} valueKey="revenue" format={formatVND} interval={interval} />
          </ChartBlock>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-14">
          <ChartBlock title="Vé bán" total={sales.data ? `${formatNumber(sales.data.reduce((a, r) => a + (r.tickets || 0), 0))} vé` : null} query={sales}>
            <TicketsChart data={sales.data ?? NONE} interval={interval} />
            <SrTable caption="Vé bán theo thời gian" rows={sales.data ?? NONE} valueKey="tickets" format={formatNumber} interval={interval} />
          </ChartBlock>

          <EventStatusSummary summary={s} />
        </motion.div>

        <motion.section variants={fadeUp} className="mt-14" aria-label="Sự kiện bán chạy">
          <BlockTitle title="Sự kiện bán chạy">
            <Link to="/organizer/events" className="inline-flex items-center gap-1.5 text-sm link-quiet">
              Tất cả sự kiện
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </BlockTitle>
          <TopEvents query={top} />
        </motion.section>
      </motion.div>
    );
  }

  return (
    <div>
      <OrgHeader
        eyebrow="Ban tổ chức"
        title="Tổng quan"
        meta={<span className="tabular-nums">{formatRangeLabel(s?.from || from, s?.to || to)}</span>}
      >
        {/* key theo khoảng đang chọn: URL đổi (Back/Forward, bấm preset) → ô ngày tự chọn reset theo URL. */}
        {!isNew ? <RangeControls key={`${range}-${from}-${to}`} range={range} from={from} to={to} interval={interval} invalid={invalid} onChange={update} /> : null}
      </OrgHeader>

      {content}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <StatStripSkeleton />
      <div className="mt-12 border-b border-border pb-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-5 h-70 w-full rounded-none opacity-60" />
      <div className="mt-14 grid gap-12 lg:grid-cols-[1.7fr_1fr]">
        <Skeleton className="h-68 w-full rounded-none opacity-60" />
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
