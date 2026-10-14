export const TIME_ZONE = "Asia/Ho_Chi_Minh";

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  weekday: "short",
  hourCycle: "h23",
});

function parts(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    const [y, m, d] = value.split("-");
    const weekday = new Date(Date.UTC(+y, +m - 1, +d)).getUTCDay();
    return { year: y, month: m, day: d, hour: "00", minute: "00", weekday };
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map(({ type, value: v }) => [type, v]));
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute, weekday: WEEKDAY_INDEX[p.weekday] };
}

export const formatVND = (amount) =>
  amount == null || amount === "" ? "" : `${Math.round(Number(amount) || 0).toLocaleString("vi-VN")}đ`;

export const formatNumber = (n) => (n == null ? "" : Number(n).toLocaleString("vi-VN"));

export const formatCompactVND = (amount) => {
  const n = Number(amount) || 0;
  const abs = Math.abs(n);
  const fmt = (v, digits) => v.toLocaleString("vi-VN", { maximumFractionDigits: digits });
  if (abs >= 1e9) return `${fmt(n / 1e9, 2)} tỷ`;
  if (abs >= 1e6) return `${fmt(n / 1e6, 1)} tr`;
  if (abs >= 1e3) return `${fmt(n / 1e3, 0)}k`;
  return fmt(n, 0);
};

export const formatPercentChange = (pct) => {
  if (pct == null || Number.isNaN(Number(pct))) return "";
  const n = Number(pct);
  return `${n > 0 ? "+" : ""}${n.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
};

export const formatDate = (value) => {
  const p = parts(value);
  return p ? `${p.day}.${p.month}.${p.year}` : "";
};

export const formatDayMonth = (value) => {
  const p = parts(value);
  return p ? `${p.day}.${p.month}` : "";
};

export const formatDateLong = (value) => {
  const p = parts(value);
  return p ? `${WEEKDAYS[p.weekday]}, ${p.day}.${p.month}.${p.year}` : "";
};

export const formatTime = (value) => {
  const p = parts(value);
  return p ? `${p.hour}:${p.minute}` : "";
};

export const formatDateTime = (value) => {
  const p = parts(value);
  return p ? `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}` : "";
};

export const formatTimeRange = (start, end) => {
  if (!start) return "";
  if (!end) return formatTime(start);
  if (formatDate(start) === formatDate(end)) return `${formatTime(start)}-${formatTime(end)}`;
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};

const relative = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
const STEPS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export const formatRelative = (value, now = Date.now()) => {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (Math.abs(seconds) < 45) return "vừa xong";
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return relative.format(Math.round(seconds / 60), "minute");
};

export const shortCode = (s, head = 6, tail = 4) =>
  s && s.length > head + tail + 3 ? `${s.slice(0, head)}...${s.slice(-tail)}` : s || "";

export const todayISODate = (now = new Date()) => {
  const p = parts(now);
  return `${p.year}-${p.month}-${p.day}`;
};

export const addDaysISO = (isoDate, days) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
};

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
