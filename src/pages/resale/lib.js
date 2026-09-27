import { RESALE_CUTOFF_HOURS, RESALE_MIN_PRICE } from "@/lib/business";
import { formatNumber, formatVND } from "@/lib/format";
import { z } from "@/lib/forms";
import { cn } from "@/lib/utils";

/** Chênh lệch giá bán so với giá gốc, làm tròn 1 chữ số thập phân. null khi không tính được. */
export function priceDiffPct(price, original) {
  const p = Number(price);
  const o = Number(original);
  if (!o || !Number.isFinite(p) || !Number.isFinite(o)) return null;
  return Math.round(((p - o) / o) * 1000) / 10;
}

/** -16,7% / +5% / "Bằng giá gốc" */
export function formatDiff(pct) {
  if (pct == null) return "";
  if (pct === 0) return "Bằng giá gốc";
  const n = Math.abs(pct).toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  return pct > 0 ? `+${n}%` : `-${n}%`;
}

/** "1.250.000" → 1250000 ; "" → null. Bỏ mọi ký tự không phải số. */
export function parseMoneyInput(text) {
  const digits = String(text ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits.slice(0, 12));
}

/** 1250000 → "1.250.000" (hiển thị trong ô nhập, không có "đ"). */
export function formatMoneyInput(value) {
  return value == null || value === "" ? "" : formatNumber(value);
}

/**
 * Lý do vé không bán lại được (MyTicketResponse), để giải thích cho người dùng.
 * Trả về { title, description } hoặc null khi vé bán được / đang có tin bán.
 */
export function notResellableReason(ticket, { now = Date.now(), cutoffHours = RESALE_CUTOFF_HOURS } = {}) {
  if (!ticket || ticket.resellable || ticket.listing) return null;
  if (ticket.status && ticket.status !== "ACTIVE") {
    return {
      title: "Vé không còn hiệu lực",
      description:
        ticket.status === "REFUND_PENDING"
          ? "Vé đang chờ hoàn tiền nên không thể đăng bán lại."
          : "Vé đã được hoàn tiền nên không thể đăng bán lại.",
    };
  }
  const startsAt = ticket.event?.startsAt ? new Date(ticket.event.startsAt).getTime() : null;
  if (startsAt != null && startsAt <= now) {
    return { title: "Sự kiện đã diễn ra", description: "Vé của sự kiện đã bắt đầu hoặc đã kết thúc không thể bán lại." };
  }
  if (startsAt != null && startsAt - now <= cutoffHours * 3600_000) {
    return {
      title: "Sự kiện sắp diễn ra",
      description: `Việc bán lại đóng ${cutoffHours} giờ trước giờ bắt đầu để người mua kịp nhận vé.`,
    };
  }
  if (!Number(ticket.price)) {
    return { title: "Vé miễn phí", description: "Vé miễn phí không thể đăng bán lại." };
  }
  return { title: "Vé chưa thể bán lại", description: "Vé này hiện không đủ điều kiện đăng bán lại." };
}

/** Câu mô tả một dòng lịch sử giao dịch (TicketHistoryItem). */
export function describeHistory(item) {
  const from = item?.from?.displayName;
  const to = item?.to?.displayName;
  const price = item?.price != null ? formatVND(item.price) : null;
  switch (item?.type) {
    case "ISSUED":
      return [to ? `Phát hành cho ${to}` : "Vé được phát hành", price && `giá ${price}`].filter(Boolean).join(", ");
    case "LISTED":
      return [from ? `${from} đăng bán lại` : "Đăng bán lại", price && `giá ${price}`].filter(Boolean).join(", ");
    case "PRICE_CHANGED":
      return price ? `Đổi giá bán thành ${price}` : "Đổi giá bán";
    case "DELISTED":
      return from ? `${from} gỡ tin bán` : "Gỡ tin bán";
    case "RESOLD":
      return [from && to ? `${from} chuyển nhượng cho ${to}` : "Chuyển nhượng", price && `giá ${price}`].filter(Boolean).join(", ");
    default:
      return item?.type || "";
  }
}

/** Schema giá bán: số nguyên trong [min, maxResalePrice]; min = giá sàn BE cấu hình (useAppConfig().resaleMinPrice). */
export function priceSchema(max, min = RESALE_MIN_PRICE) {
  let price = z
    .number({ error: "Nhập giá bán" })
    .int({ error: "Giá bán phải là số nguyên" })
    .min(min, { error: `Giá bán tối thiểu ${formatVND(min)}` });
  if (max != null) price = price.max(max, { error: `Giá bán tối đa ${formatVND(max)} (giá trần)` });
  return z.object({ price });
}

export const PRICE_PRESETS = [
  { key: "lt500", label: "Dưới 500.000đ", priceMin: "", priceMax: "500000" },
  { key: "500-1m", label: "500.000đ - 1.000.000đ", priceMin: "500000", priceMax: "1000000" },
  { key: "1m-2m", label: "1.000.000đ - 2.000.000đ", priceMin: "1000000", priceMax: "2000000" },
  { key: "gt2m", label: "Trên 2.000.000đ", priceMin: "2000000", priceMax: "" },
];

/** Nhãn khoảng giá cho chip bộ lọc đang áp dụng. */
export function priceRangeLabel(priceMin, priceMax) {
  const preset = PRICE_PRESETS.find((p) => p.priceMin === (priceMin || "") && p.priceMax === (priceMax || ""));
  if (preset) return preset.label;
  if (priceMin && priceMax) return `${formatVND(priceMin)} - ${formatVND(priceMax)}`;
  if (priceMin) return `Từ ${formatVND(priceMin)}`;
  if (priceMax) return `Đến ${formatVND(priceMax)}`;
  return "";
}

/** Lưới vé bán lại 3 hoặc 4 cột (cùng nhịp với EventGrid). */
const COLS = { 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };
export const listingGridClass = (columns = 3) => cn("grid grid-cols-1 gap-x-6 gap-y-12", COLS[columns]);
