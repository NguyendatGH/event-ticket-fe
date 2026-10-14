import { Link } from "react-router-dom";
import { formatNumber, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ROW, SoldMeter, TH, TH_ROW } from "./OrgUi";

const TD_NUM = "py-4 pl-4 text-right tabular-nums";

export function TierTable({ eventId, tiers }) {
  if (!tiers.length)
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Chưa có hạng vé.{" "}
        <Link to={`/organizer/events/${eventId}/edit?step=3`} className="link-accent">
          Thêm hạng vé
        </Link>
      </p>
    );
  const totals = tiers.reduce(
    (a, t) => ({
      total: a.total + (t.totalQuantity || 0),
      sold: a.sold + (t.sold || 0),
      reserved: a.reserved + (t.reserved || 0),
      available: a.available + (t.available || 0),
      revenue: a.revenue + (t.revenue || 0),
    }),
    { total: 0, sold: 0, reserved: 0, available: 0, revenue: 0 }
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 text-sm">
        <thead>
          <tr className={TH_ROW}>
            <th scope="col" className={TH}>Hạng vé</th>
            {["Giá", "Tổng", "Đã bán", "Đang giữ", "Còn lại"].map((h) => (
              <th key={h} scope="col" className={cn(TH, "text-right")}>
                {h}
              </th>
            ))}
            <th scope="col" className={cn(TH, "pl-8")}>Tiến độ</th>
            <th scope="col" className={cn(TH, "text-right")}>Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t) => (
            <tr key={t.id} className={ROW}>
              <td className="py-4 pr-6">
                <p className="font-medium text-foreground">{t.name}</p>
                {t.description ? <p className="mt-0.5 max-w-[36ch] truncate text-meta text-muted-foreground">{t.description}</p> : null}
              </td>
              <td className={cn(TD_NUM, "text-foreground")}>{t.price === 0 ? "Miễn phí" : formatVND(t.price)}</td>
              <td className={cn(TD_NUM, "text-secondary-foreground")}>{formatNumber(t.totalQuantity)}</td>
              <td className={cn(TD_NUM, "text-foreground")}>{formatNumber(t.sold)}</td>
              <td className={cn(TD_NUM, t.reserved ? "text-warning" : "text-disabled-foreground")}>{formatNumber(t.reserved)}</td>
              <td className={cn(TD_NUM, t.available === 0 ? "text-destructive" : "text-secondary-foreground")}>{t.available === 0 ? "Hết" : formatNumber(t.available)}</td>
              <td className="py-4 pl-8">
                <SoldMeter
                  className="w-28"
                  delay={0.1}
                  sold={t.sold}
                  reserved={t.reserved}
                  total={t.totalQuantity}
                  label={`${t.name}: đã bán ${t.sold}, đang giữ ${t.reserved} trên ${t.totalQuantity}`}
                />
              </td>
              <td className={cn(TD_NUM, "text-foreground")}>{formatVND(t.revenue ?? 0)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-muted-foreground">
            <th scope="row" className="py-4 text-left text-xs font-medium tracking-caps uppercase">
              Tổng
            </th>
            <td />
            <td className={TD_NUM}>{formatNumber(totals.total)}</td>
            <td className={cn(TD_NUM, "text-foreground")}>{formatNumber(totals.sold)}</td>
            <td className={TD_NUM}>{formatNumber(totals.reserved)}</td>
            <td className={TD_NUM}>{formatNumber(totals.available)}</td>
            <td />
            <td className={cn(TD_NUM, "font-medium text-foreground")}>{formatVND(totals.revenue)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
