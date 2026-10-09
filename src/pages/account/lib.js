import { formatDayMonth, TIME_ZONE } from "@/lib/format";

export const ORDER_FILTERS = [
  { value: "all", label: "Tất cả", status: "" },
  { value: "paid", label: "Thành công", status: "PAID" },
  { value: "pending", label: "Đang xử lý", status: "PENDING_PAYMENT,MANUAL_REVIEW" },
  { value: "cancelled", label: "Đã hủy", status: "CANCELLED,EXPIRED" },
];

export const orderFilterOf = (value) => ORDER_FILTERS.find((f) => f.value === value) ?? ORDER_FILTERS[0];

export const ticketCount = (order) => (order?.items ?? []).reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

export function dateTile(value) {
  const [day, month] = formatDayMonth(value).split(".");
  return day ? { day, month: `Th${Number(month)}` } : null;
}

const MONTH_PARTS = new Intl.DateTimeFormat("en-US", { month: "numeric", year: "numeric", timeZone: TIME_ZONE });

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
