import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ErrorState, StatusBadge } from "@/components/site";
import { Meter } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber, formatVND } from "@/lib/format";
import { riseSm } from "@/lib/motion";
import { ROW, TH_ROW } from "./OrgUi";

export function TopEvents({ query }) {
  if (query.isPending)
    return (
      <div role="status" aria-label="Đang tải">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-6 border-b border-border py-4">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  if (query.isError) return <ErrorState compact error={query.error} onRetry={query.refetch} />;
  const rows = query.data || [];
  if (!rows.length) return <p className="py-6 text-sm text-muted-foreground">Chưa có đơn thanh toán nào trong khoảng thời gian này.</p>;
  const max = Math.max(...rows.map((r) => r.revenue || 0), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-130 text-sm">
        <thead>
          <tr className={TH_ROW}>
            <th scope="col" className="w-10 py-3 font-medium">#</th>
            <th scope="col" className="py-3 font-medium">Sự kiện</th>
            <th scope="col" className="py-3 font-medium max-sm:hidden">Ngày</th>
            <th scope="col" className="py-3 font-medium">Trạng thái</th>
            <th scope="col" className="py-3 text-right font-medium">Vé bán</th>
            <th scope="col" className="w-55 py-3 text-right font-medium">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <motion.tr key={e.id} initial={riseSm.hidden} animate={{ ...riseSm.show, transition: { ...riseSm.show.transition, delay: 0.2 + i * 0.05 } }} className={ROW}>
              <td className="py-4 text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</td>
              <td className="py-4 pr-6">
                <Link to={`/organizer/events/${e.id}`} className="font-medium text-foreground transition-colors hover:text-primary">
                  {e.name}
                </Link>
              </td>
              <td className="py-4 pr-6 whitespace-nowrap text-secondary-foreground tabular-nums max-sm:hidden">{formatDate(e.startsAt)}</td>
              <td className="py-4 pr-6">
                <StatusBadge kind="event" status={e.status} />
              </td>
              <td className="py-4 text-right text-foreground tabular-nums">{formatNumber(e.ticketsSold)}</td>
              <td className="py-4 pl-6">
                <div className="flex items-center justify-end gap-3">
                  <Meter value={(e.revenue || 0) / max} delay={0.25 + i * 0.05} className="hidden h-1 w-20 sm:block" />
                  <span className="text-foreground tabular-nums">{formatVND(e.revenue)}</span>
                </div>
              </td>
            </motion.tr>
          ))}
          {rows.length < 3 ? (
            <tr>
              <td />
              <td colSpan={5} className="py-4 text-meta text-disabled-foreground">
                Các sự kiện khác chưa có doanh thu trong kỳ này.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
