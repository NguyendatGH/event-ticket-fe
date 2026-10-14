import { client, newIdempotencyKey } from "../client";

export const create = (orderId, body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post(`/orders/${orderId}/refunds`, body, { headers: { "Idempotency-Key": idempotencyKey } });

export const byOrder = (orderId) => client.get(`/orders/${orderId}/refunds`);

export const get = (id) => client.get(`/refunds/${id}`);

export const isSettled = (refund) => ["SUCCEEDED", "FAILED"].includes(refund?.status);
