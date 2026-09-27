/**
 * Helper thuần (không React) của khu organizer:
 *   - ngày giờ cho <input type="datetime-local"> (luôn theo giờ Việt Nam)
 *   - khoảng thời gian của trang tổng quan (đọc/ghi trên URL) + nhãn trục biểu đồ
 *   - số liệu (phần trăm) và đoạn văn mô tả (textarea ⇄ mảng description của BE)
 * Test: ./helpers.test.js.
 */
import { TIME_ZONE, addDaysISO, formatDate, formatDayMonth, todayISODate } from "@/lib/format";

/* ---------- Ngày giờ: <input type="datetime-local"> luôn hiểu theo giờ Việt Nam (GMT+7) ---------- */

const localParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "2026-10-24T12:30:00Z" → "2026-10-24T19:30" (giá trị cho datetime-local, giờ VN). */
export function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = Object.fromEntries(localParts.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** "2026-10-24T19:30" (giờ VN) → "2026-10-24T12:30:00.000Z". Rỗng/sai → null. */
export function localInputToIso(value) {
  if (!value) return null;
  const withSeconds = /T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
  const d = new Date(`${withSeconds}+07:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* ---------- Khoảng thời gian dashboard (URL: range=7|30|90|custom, from, to, interval) ---------- */

export const RANGE_PRESETS = [
  { value: "7", label: "7 ngày", days: 7 },
  { value: "30", label: "30 ngày", days: 30 },
  { value: "90", label: "90 ngày", days: 90 },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const INTERVALS = ["day", "week", "month"];

/** Đọc search params → { range, from, to, interval, invalid }. Custom sai → quay về 30 ngày. */
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

/** "2026-10-24" → mốc thời gian (ms) lúc 00:00 UTC ngày đó. Tháng trong Date.UTC đếm từ 0 nên phải trừ 1. */
function isoDateToUtcMs(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Số ngày giữa hai chuỗi YYYY-MM-DD (to - from). */
function daysBetween(from, to) {
  return Math.round((isoDateToUtcMs(to) - isoDateToUtcMs(from)) / 86_400_000);
}

/** "01.09 - 30.09.2026" */
export function formatRangeLabel(from, to) {
  if (!from || !to) return "";
  if (from.slice(0, 4) === to.slice(0, 4)) return `${formatDayMonth(from)} - ${formatDate(to)}`;
  return `${formatDate(from)} - ${formatDate(to)}`;
}

/** Nhãn trục X theo interval. */
export function formatBucketTick(date, interval) {
  if (interval === "month") return `${date.slice(5, 7)}.${date.slice(0, 4)}`;
  return formatDayMonth(date);
}

/** Nhãn tooltip theo interval. */
export function formatBucketLabel(date, interval) {
  if (interval === "month") return `Tháng ${date.slice(5, 7)}.${date.slice(0, 4)}`;
  if (interval === "week") return `Tuần từ ${formatDate(date)}`;
  return formatDate(date);
}

/* ---------- Số liệu ---------- */

/** Phần trăm 0-100, an toàn khi total = 0. */
export const percentOf = (part, total) => (total > 0 ? Math.min(100, Math.max(0, (part / total) * 100)) : 0);

/** Đoạn văn: textarea (cách nhau dòng trống) ⇄ mảng description của BE. */
export const textToParagraphs = (text) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const paragraphsToText = (list) => (Array.isArray(list) ? list.filter(Boolean).join("\n\n") : "");
