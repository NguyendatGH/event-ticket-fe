import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ordersApi from "../services/orders";
import * as mockGatewayApi from "../services/mockGateway";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { withAfter } from "./withAfter";
import { cleanParams } from "../params";

/**
 * GET /orders/{id}. `poll: true` → tự refetch mỗi 2s tới khi đơn có kết quả (trang return / chờ thanh toán).
 */
export const useOrder = (id, { poll = false, pollInterval = 2000, ...options } = {}) =>
  useQuery({
    queryKey: qk.orders.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (poll && !ordersApi.isSettled(query.state.data) ? pollInterval : false),
    ...options,
  });

/**
 * GET /me/orders?status=&page&size (infinite), mới nhất trước.
 *   useMyOrders()                              // mọi đơn
 *   useMyOrders({ status: "PAID" })            // lọc theo OrderStatus (contract §1); "" / undefined = tất cả
 * Mỗi bộ lọc là một cache riêng (status nằm trong query key qk.me.orders(params)).
 */
export const useMyOrders = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.me.orders(clean), ordersApi.mine, clean), ...options });
};

/** Đơn thay đổi → cập nhật cache đơn, làm mới tồn kho, vé, bán lại. */
function useAfterOrderChange() {
  const qc = useQueryClient();
  return (order) => {
    if (order?.id) qc.setQueryData(qk.orders.detail(order.id), order);
    qc.invalidateQueries({ queryKey: qk.me.all });
    qc.invalidateQueries({ queryKey: qk.events.all });
    qc.invalidateQueries({ queryKey: qk.resale.all });
  };
}

/**
 * POST /orders. mutate({ body, idempotencyKey }) - trang tạo một key mới cho mỗi lần bấm "Thanh toán";
 * request bị gửi lại (vd sau khi refresh token) giữ nguyên key nên BE trả lại đúng đơn cũ, không tạo đơn trùng.
 */
export function useCreateOrder(options = {}) {
  const after = useAfterOrderChange();
  return useMutation(withAfter({ mutationFn: ({ body, idempotencyKey }) => ordersApi.create(body, { idempotencyKey }), ...options }, after));
}

/** POST /orders/{id}/cancel. mutate(id) */
export function useCancelOrder(options = {}) {
  const after = useAfterOrderChange();
  return useMutation(withAfter({ mutationFn: ordersApi.cancel, ...options }, after));
}

/** Cổng giả lập: mutate({ orderId, action: "succeed" | "fail" | "expire", flags? }) → OrderResponse */
export function useMockGatewayAction(options = {}) {
  const after = useAfterOrderChange();
  return useMutation(withAfter({ mutationFn: ({ orderId, action, flags }) => mockGatewayApi[action](orderId, flags), ...options }, after));
}
