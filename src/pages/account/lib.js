/* Hàm thuần cho danh sách đơn hàng (/me/orders): bộ lọc trạng thái, đếm vé, gom theo tháng, ô ngày. */
import { formatDayMonth, TIME_ZONE } from "@/lib/format";

/**
 * Tab lọc đơn: value nằm trên URL (?status=paid…), status gửi lên GET /me/orders?status= (nhiều giá trị cách dấu phẩy, contract).
 * "all" là mặc định nên không ghi lên URL. "Đang xử lý" gồm cả đơn đang đối soát (MANUAL_REVIEW).
 */
export const ORDER_FILTERS = [
  { value: "all", label: "Tất cả", status: "" },
  { value: "paid", label: "Thành công", status: "PAID" },
  { value: "pending", label: "Đang xử lý", status: "PENDING_PAYMENT,MANUAL_REVIEW" },
  { value: "cancelled", label: "Đã hủy", status: "CANCELLED,EXPIRED" },
];

/** Giá trị ?status= trên URL → mục ORDER_FILTERS (giá trị lạ → "Tất cả"). */
export const orderFilterOf = (value) => ORDER_FILTERS.find((f) => f.value === value) ?? ORDER_FILTERS[0];

/** Tổng số vé của một OrderResponse. */
export const ticketCount = (order) => (order?.items ?? []).reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

/** Ô lịch của thẻ đơn: "2026-09-20T12:00:00Z" → { day: "20", month: "Th9" } (giờ VN). */
export function dateTile(value) {
  const [day, month] = formatDayMonth(value).split(".");
  return day ? { day, month: `Th${Number(month)}` } : null;
}

const MONTH_PARTS = new Intl.DateTimeFormat("en-US", { month: "numeric", year: "numeric", timeZone: TIME_ZONE });

/** Gom đơn (đã sắp mới nhất trước) theo tháng đặt: [{ key: "2026-9", label: "Tháng 9, 2026", orders }]. */
export function groupByMonth(orders) {
  const groups = [];
  for (const order of orders) {
    const parts = Object.fromEntries(MONTH_PARTS.formatToParts(new Date(order.createdAt)).map((p) => [p.type, p.value]));
    const key = `${parts.year}-${parts.month}`;
    if (groups.at(-1)?.key !== key) groups.push({ key, label: `Tháng ${parts.month}, ${parts.year}`, orders: [] });
    groups.at(-1).orders.push(order);
  }
  return groups;
}
