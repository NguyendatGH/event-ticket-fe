import { motion } from "motion/react";
import { StatusBadge } from "@/components/site";
import { formatDateTime, formatNumber, formatVND } from "@/lib/format";
import { rowItem } from "@/lib/motion";
import { ROW } from "./OrgUi";

/*
 * Một đơn hàng trong khối "Đơn hàng" (EventOrders), 2 kiểu hiển thị cùng dữ liệu:
 *   EventOrderRow   hàng <tr> của bảng (từ md)
 *   EventOrderItem  thẻ <li> xếp chồng (điện thoại)
 */

/** Hàng mới (trang đầu / "Tải thêm đơn") trượt lên nhẹ, stagger theo vị trí trong trang vừa tải. */
const rowIn = (index) => ({
  initial: rowItem.initial,
  animate: { ...rowItem.animate, transition: { ...rowItem.animate.transition, delay: Math.min(index, 9) * 0.03 } },
});

/** Mã đơn dài (id số 16 chữ số) rút gọn còn 6 số cuối; mã đầy đủ ở title và cho trình đọc màn hình. */
function OrderCode({ code }) {
  const c = String(code ?? "");
  if (c.length <= 10) return <code>#{c}</code>;
  return (
    <code title={c}>
      <span aria-hidden="true">#…{c.slice(-6)}</span>
      <span className="sr-only">{c}</span>
    </code>
  );
}

export function EventOrderRow({ order: o, index = 0 }) {
  return (
    <motion.tr {...rowIn(index)} className={ROW}>
      <td className="py-3.5 pr-6 whitespace-nowrap text-muted-foreground tabular-nums">
        <OrderCode code={o.orderCode} />
        {o.kind === "RESALE" ? (
          <span className="ml-2 align-middle">
            <StatusBadge kind="orderKind" status="RESALE" />
          </span>
        ) : null}
      </td>
      <td className="py-3.5 pr-6">
        <p className="text-foreground">{o.customer?.name || "Khách"}</p>
        <p className="text-meta text-muted-foreground">
          {[o.customer?.email, o.customer?.phone].filter(Boolean).join(", ")}
        </p>
      </td>
      <td className="py-3.5 text-center text-foreground tabular-nums">
        {formatNumber(o.quantity)}
      </td>
      <td className="py-3.5 pl-6 text-right whitespace-nowrap text-foreground tabular-nums">
        {formatVND(o.totalAmount)}
      </td>
      <td className="py-3.5 pl-8">
        <StatusBadge kind="order" status={o.status} />
      </td>
      <td className="py-3.5 pl-6 text-right whitespace-nowrap text-secondary-foreground tabular-nums">
        {formatDateTime(o.paidAt || o.createdAt)}
      </td>
    </motion.tr>
  );
}

export function EventOrderItem({ order: o, index = 0 }) {
  return (
    <motion.li {...rowIn(index)} className="border-b border-border py-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-medium text-foreground">
          {o.customer?.name || "Khách"}
        </p>
        <p className="shrink-0 font-medium text-foreground tabular-nums">
          {formatVND(o.totalAmount)}
        </p>
      </div>
      <p className="mt-0.5 truncate text-meta text-muted-foreground">
        {[o.customer?.email, o.customer?.phone].filter(Boolean).join(", ")}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta text-secondary-foreground tabular-nums">
        <StatusBadge kind="order" status={o.status} />
        {o.kind === "RESALE" ? (
          <StatusBadge kind="orderKind" status="RESALE" />
        ) : null}
        <OrderCode code={o.orderCode} />
        <span>{formatNumber(o.quantity)} vé</span>
        <span>{formatDateTime(o.paidAt || o.createdAt)}</span>
      </div>
    </motion.li>
  );
}
