// Helper thuần (không React) của khu organizer:

import { TIME_ZONE, addDaysISO, formatDate, formatDayMonth, todayISODate } from "@/lib/format";

const localParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = Object.fromEntries(localParts.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function localInputToIso(value) {
  if (!value) return null;
  const withSeconds = /T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
  const d = new Date(`${withSeconds}+07:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const RANGE_PRESETS = [
  { value: "7", label: "7 ngày", days: 7 },
  { value: "30", label: "30 ngày", days: 30 },
  { value: "90", label: "90 ngày", days: 90 },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const INTERVALS = ["day", "week", "month"];

export function resolveRange(params, today = todayISODate()) {
  const range = params.get("range") || "30";
  const intervalParam = params.get("interval");
  const interval = INTERVALS.includes(intervalParam) ? intervalParam : "day";
  if (range === "custom") {
    const from = params.get("from");
    const to = params.get("to");
    const valid = ISO_DATE.test(from || "") && ISO_DATE.test(to || "") && from <= to && daysBetween(from, to) <= 366;
    if (valid) return { range, from, to, interval };
    return { range: "custom", from: from || addDaysISO(today, -29), to: to || today, interval, invalid: true };
  }
  const preset = RANGE_PRESETS.find((p) => p.value === range) || RANGE_PRESETS[1];
  return { range: preset.value, from: addDaysISO(today, -(preset.days - 1)), to: today, interval };
}

function isoDateToUtcMs(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function daysBetween(from, to) {
  return Math.round((isoDateToUtcMs(to) - isoDateToUtcMs(from)) / 86_400_000);
}

export function formatRangeLabel(from, to) {
  if (!from || !to) return "";
  if (from.slice(0, 4) === to.slice(0, 4)) return `${formatDayMonth(from)} - ${formatDate(to)}`;
  return `${formatDate(from)} - ${formatDate(to)}`;
}

export function formatBucketTick(date, interval) {
  if (interval === "month") return `${date.slice(5, 7)}.${date.slice(0, 4)}`;
  return formatDayMonth(date);
}

export function formatBucketLabel(date, interval) {
  if (interval === "month") return `Tháng ${date.slice(5, 7)}.${date.slice(0, 4)}`;
  if (interval === "week") return `Tuần từ ${formatDate(date)}`;
  return formatDate(date);
}

export const percentOf = (part, total) => (total > 0 ? Math.min(100, Math.max(0, (part / total) * 100)) : 0);

/**
 * Hai trạng thái refund mà BAN TỔ CHỨC phải ra tay:
 * - MANUAL_REVIEW: hệ thống bó tay, BTC chuyển khoản tay rồi chốt kết quả.
 * - AWAITING_FUNDS: ví chi thiếu tiền, BTC phải nạp ví (hệ thống tự gửi lại khi đủ).
 * Dùng chung cho badge ở Tổng quan và tab mặc định của trang Hoàn tiền.
 */
export const REFUND_NEEDS_ACTION = ["MANUAL_REVIEW", "AWAITING_FUNDS"];

/**
 * Hai trạng thái mà BTC được HỦY hẳn yêu cầu hoàn tiền (BE: outcome=CANCELLED): tiền chưa đi đâu
 * cả nên còn quay đầu được. Trạng thái khác (đang chạy hoặc đã chốt) BE trả 409, nên FE không hiện nút.
 */
export const REFUND_CANCELLABLE = ["AWAITING_FUNDS", "MANUAL_REVIEW"];

/**
 * Vì sao KHÔNG hủy được yêu cầu này — trả null nghĩa là hủy được.
 * - "status": trạng thái không cho hủy → không hiện gì, đừng cho bấm rồi để BE trả 409.
 * - "provider": cổng thanh toán đã nhận lệnh chi (providerRefundId != null) nên tiền CÓ THỂ đã đi.
 *   Hủy lúc này là mất dấu tiền, BE chặn bằng 409 REFUND_ALREADY_AT_PROVIDER — giống y hệt lý do
 *   nút "Gửi lại qua cổng" bị ẩn. FE chặn trước để BTC không phải ăn lỗi server mới biết.
 */
export function refundCancelBlocker(refund) {
  if (!REFUND_CANCELLABLE.includes(refund?.status)) return "status";
  if (refund?.providerRefundId) return "provider";
  return null;
}

export const countRefunds = (refunds, statuses) =>
  (refunds ?? []).filter((r) => statuses.includes(r?.status)).length;

export const countRefundsNeedingAction = (refunds) => countRefunds(refunds, REFUND_NEEDS_ACTION);

export const textToParagraphs = (text) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const paragraphsToText = (list) => (Array.isArray(list) ? list.filter(Boolean).join("\n\n") : "");
