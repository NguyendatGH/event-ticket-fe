import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ordersApi from "../services/orders";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { withAfter } from "./withAfter";
import { cleanParams } from "../params";

export const useOrder = (id, { poll = false, pollInterval = 2000, ...options } = {}) =>
  useQuery({
    queryKey: qk.orders.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: Boolean(id),
    // 404 (đơn không có / không thuộc tài khoản này) thì dừng poll. Chưa từng có data mà refetch thì React Query đưa
    // query về pending, trang đổi từ "không tìm thấy" sang "đang tải" rồi lại 404 mỗi 2 giây, nhìn như bị giật.
    refetchInterval: (query) =>
      poll && !query.state.error?.isNotFound && !ordersApi.isSettled(query.state.data) ? pollInterval : false,
    ...options,
  });

export const useMyOrders = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.me.orders(clean), ordersApi.mine, clean), ...options });
};

function useAfterOrderChange() {
  const qc = useQueryClient();
  return (order) => {
    if (order?.id) qc.setQueryData(qk.orders.detail(order.id), order);
    qc.invalidateQueries({ queryKey: qk.me.all });
    qc.invalidateQueries({ queryKey: qk.me.wallet });
    qc.invalidateQueries({ queryKey: qk.events.all });
  };
}

export function useCreateOrder(options = {}) {
  const after = useAfterOrderChange();
  return useMutation(withAfter({ mutationFn: ({ body, idempotencyKey }) => ordersApi.create(body, { idempotencyKey }), ...options }, after));
}

export function useCancelOrder(options = {}) {
  const after = useAfterOrderChange();
  return useMutation(withAfter({ mutationFn: ordersApi.cancel, ...options }, after));
}
