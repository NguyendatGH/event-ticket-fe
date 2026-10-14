import { Link } from "react-router-dom";
import { AnimatedNumber } from "@/components/motion";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { percentOf } from "../lib";
import { BlockTitle, SoldMeter } from "./OrgUi";

const EVENT_STATUS_ROWS = [
  { key: "published", status: "PUBLISHED", label: "Đang bán" },
  { key: "upcoming", status: "UPCOMING", label: "Sắp mở bán" },
  { key: "draft", status: "DRAFT", label: "Bản nháp" },
  { key: "ended", status: "ENDED", label: "Đã kết thúc" },
  { key: "cancelled", status: "CANCELLED", label: "Đã hủy" },
];

export function EventStatusSummary({ summary: s }) {
  return (
    <section aria-label="Sự kiện và vé">
      <BlockTitle title="Sự kiện theo trạng thái" />
      <ul>
        {EVENT_STATUS_ROWS.map((row) => {
          const n = s.events?.[row.key] ?? 0;
          return (
            <li key={row.key} className="flex items-center justify-between border-b border-border py-2.5 text-sm">
              <Link
                to={row.status === "CANCELLED" ? "/organizer/events" : `/organizer/events?status=${row.status}`}
                className={cn("link-quiet", n === 0 && "text-disabled-foreground")}
              >
                {row.label}
              </Link>
              <AnimatedNumber value={n} format={formatNumber} className={n ? "text-foreground" : "text-disabled-foreground"} />
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <p className="eyebrow">Vé phát hành</p>
        <p className="mt-3 text-2xl font-semibold text-foreground tabular-nums">
          <AnimatedNumber value={s.tickets?.sold ?? 0} format={formatNumber} />
          <span className="text-base font-normal text-muted-foreground"> / {formatNumber(s.tickets?.total ?? 0)}</span>
        </p>
        <SoldMeter className="mt-4" label="Tỉ lệ vé đã bán" sold={s.tickets?.sold ?? 0} total={s.tickets?.total ?? 0} />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>Đã bán {Math.round(percentOf(s.tickets?.sold ?? 0, s.tickets?.total ?? 0))}%</span>
          <span>Còn {formatNumber(s.tickets?.available ?? 0)}</span>
        </div>
      </div>
    </section>
  );
}
