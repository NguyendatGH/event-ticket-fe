import { client, newIdempotencyKey } from "../client";

/** Checkout, contract §4.6 */

/**
 * POST /orders (header Idempotency-Key)
 * body: { eventId, items: [{ tierId, quantity }], customer: { name, email, phone } }
 * → 201 OrderResponse (PENDING_PAYMENT, payment.checkoutUrl). Có Bearer → đơn gắn user.
 * Truyền cùng `idempotencyKey` khi thử lại để không tạo đơn trùng.
 */
export const create = (body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post("/orders", body, { headers: { "Idempotency-Key": idempotencyKey } });

/** GET /orders/{id} → OrderResponse */
export const get = (id) => client.get(`/orders/${id}`);

/** POST /orders/{id}/cancel → OrderResponse */
export const cancel = (id) => client.post(`/orders/${id}/cancel`);

/** GET /me/orders?status&page&size → Page<OrderResponse> mới nhất trước. status (tùy chọn) = OrderStatus. */
export const mine = (params) => client.get("/me/orders", { params });

/** Đơn đã có kết quả thanh toán (không cần poll nữa). */
export const isSettled = (order) =>
  Boolean(order) &&
  (["PAID", "EXPIRED", "CANCELLED", "MANUAL_REVIEW", "REFUNDED", "PARTIALLY_REFUNDED", "REFUND_PROCESSING", "REFUND_FAILED"].includes(order.status) ||
    ["FAILED", "EXPIRED"].includes(order.payment?.status));
