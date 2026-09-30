// Hoàn tiền theo vé. POST trả 202, kết quả về bất đồng bộ nên phải poll GET /refunds/{id}.

import { client, newIdempotencyKey } from "../client";

/**
 * Tạo yêu cầu hoàn vé.
 * body = {
 *   ticketIds: string[],                                  // bắt buộc, vé muốn hoàn
 *   reason?: string,                                      // tối đa 500 ký tự
 *   destination?: { bin, accountNumber },                  // khác tài khoản đã trả -> BTC phải duyệt
 *   contactEmail: string,                                 // BẮT BUỘC, tối đa 200 ký tự, đúng format email
 * }
 * contactEmail là email hệ thống dùng để báo cho khách về yêu cầu này (ví dụ khi BTC hủy yêu cầu).
 * BE tự trim + lowercase khi lưu, FE chỉ cần trim trước khi gửi. Sai format -> BE trả 400.
 */
export const create = (orderId, body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post(`/orders/${orderId}/refunds`, body, { headers: { "Idempotency-Key": idempotencyKey } });

export const byOrder = (orderId) => client.get(`/orders/${orderId}/refunds`);

export const get = (id) => client.get(`/refunds/${id}`);

/** Trạng thái cuối: không đổi nữa, ngừng poll. */
export const isSettled = (refund) => ["SUCCEEDED", "FAILED"].includes(refund?.status);
