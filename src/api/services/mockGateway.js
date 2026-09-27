import { client, API_ROOT } from "../client";

/**
 * Nút bấm của cổng thanh toán giả lập (BE mọi profile trừ payos).
 * Endpoint nằm ở gốc server, không dưới /api/v1: POST /mock-gateway/payments/{orderId}/{succeed|fail|expire}
 * → OrderResponse. flags (dev): { duplicate, badSignature, amount }.
 */
const act = (action) => (orderId, flags) =>
  client.post(`/mock-gateway/payments/${orderId}/${action}`, null, {
    baseURL: API_ROOT, // "" ⇒ đường dẫn gốc cùng origin (không nối /api/v1)
    params: flags,
    skipAuth: true,
  });

export const succeed = act("succeed");
export const fail = act("fail");
export const expire = act("expire");
