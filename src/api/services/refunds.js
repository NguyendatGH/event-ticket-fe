// Hoàn tiền theo vé. POST trả 202, kết quả về bất đồng bộ nên phải poll GET /refunds/{id}.

import { client, newIdempotencyKey } from "../client";

export const create = (orderId, body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post(`/orders/${orderId}/refunds`, body, { headers: { "Idempotency-Key": idempotencyKey } });

export const byOrder = (orderId) => client.get(`/orders/${orderId}/refunds`);

export const get = (id) => client.get(`/refunds/${id}`);

/** Trạng thái cuối: không đổi nữa, ngừng poll. */
export const isSettled = (refund) => ["SUCCEEDED", "FAILED"].includes(refund?.status);
