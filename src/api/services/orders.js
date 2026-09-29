// Checkout, contract §4.6

import { client, newIdempotencyKey } from "../client";

export const create = (body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post("/orders", body, { headers: { "Idempotency-Key": idempotencyKey } });

export const get = (id) => client.get(`/orders/${id}`);

export const cancel = (id) => client.post(`/orders/${id}/cancel`);

export const mine = (params) => client.get("/me/orders", { params });

export const isSettled = (order) =>
  Boolean(order) &&
  (["PAID", "EXPIRED", "CANCELLED", "MANUAL_REVIEW", "REFUNDED", "PARTIALLY_REFUNDED", "REFUND_PROCESSING", "REFUND_FAILED"].includes(order.status) ||
    ["FAILED", "EXPIRED"].includes(order.payment?.status));
