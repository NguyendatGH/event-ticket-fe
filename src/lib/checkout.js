// Helper cho luồng mua vé (checkout → cổng thanh toán → return → success/failed).

export const RETURN_TIMEOUT_MS = 90_000;

export function parseTiers(param) {
  const out = {};
  for (const part of String(param || "").split(",")) {
    const [id, qty] = part.split(":").map((s) => s?.trim());
    const n = Number.parseInt(qty, 10);
    if (id && Number.isFinite(n) && n > 0) out[id] = (out[id] || 0) + n;
  }
  return out;
}

export const serializeTiers = (map) =>
  Object.entries(map)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => `${id}:${q}`)
    .join(",");

export const isOnSale = (event) => event?.status === "PUBLISHED";

export const EVENT_CLOSED_MESSAGE = {
  UPCOMING: "Sự kiện chưa mở bán. Quay lại khi vé được mở.",
  SOLD_OUT: "Sự kiện đã hết vé.",
  ENDED: "Sự kiện đã kết thúc.",
  CANCELLED: "Sự kiện đã bị hủy.",
  DRAFT: "Sự kiện chưa được công bố.",
};

export const CART_ERROR_CODES = ["TIER_SOLD_OUT", "QUANTITY_EXCEEDED", "EVENT_NOT_ON_SALE", "PAYMENT_LINK_FAILED"];

const FAILED_STATUSES = ["EXPIRED", "CANCELLED"];

export function orderOutcome(order) {
  if (!order) return "pending";
  if (order.status === "PAID") return "success";
  if (order.status === "MANUAL_REVIEW") return "review";
  if (FAILED_STATUSES.includes(order.status) || ["FAILED", "EXPIRED"].includes(order.payment?.status)) return "failed";
  if (order.status === "PENDING_PAYMENT") return "pending";
  return "other";
}

export function failureReason(order, param) {
  if (param) return param;
  if (order?.status === "CANCELLED") return "cancelled";
  if (order?.status === "EXPIRED" || order?.payment?.status === "EXPIRED") return "timeout";
  if (order?.payment?.status === "FAILED") return "declined";
  return "";
}

export const FAILURE_COPY = {
  declined: { title: "Giao dịch bị từ chối.", body: "Ngân hàng hoặc ví không chấp nhận thanh toán. Kiểm tra hạn mức hoặc dùng phương thức khác." },
  timeout: { title: "Giao dịch đã hết thời gian.", body: "Thời gian giữ chỗ 15 phút đã kết thúc, vé đã được trả lại." },
  cancelled: { title: "Đơn hàng đã bị hủy.", body: "Chưa có khoản nào bị trừ. Bạn có thể đặt lại bất cứ lúc nào." },
  "": { title: "Thanh toán chưa hoàn tất.", body: "Chưa có khoản nào bị trừ. Bạn có thể thử lại." },
};

export function retryHref(order) {
  if (!order) return "/events";
  const tiers = serializeTiers(Object.fromEntries((order.items || []).map((i) => [i.tierId, i.quantity])));
  return order.eventSlug ? `/checkout/${order.eventSlug}${tiers ? `?tiers=${tiers}` : ""}` : "/events";
}

export const goToGateway = (url) => window.location.assign(url);

export const venueLine = (venue) => [venue?.name, venue?.city].filter(Boolean).join(", ");

export const orderToLines = (order) =>
  (order?.items || []).map((i) => ({ key: i.tierId, label: i.tierName, quantity: i.quantity, amount: i.unitPrice * i.quantity }));
