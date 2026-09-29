// Hook hoàn tiền: danh sách theo đơn, chi tiết (có poll), tạo yêu cầu (Idempotency-Key).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as refundsApi from "../services/refunds";
import { qk } from "./keys";
import { withAfter } from "./withAfter";

export const useOrderRefunds = (orderId, options = {}) =>
  useQuery({
    queryKey: qk.orders.refunds(orderId),
    queryFn: () => refundsApi.byOrder(orderId),
    enabled: Boolean(orderId),
    ...options,
  });

export const useRefund = (id, { poll = false, pollInterval = 3000, ...options } = {}) =>
  useQuery({
    queryKey: qk.refunds.detail(id),
    queryFn: () => refundsApi.get(id),
    enabled: Boolean(id),
    refetchInterval: (query) => (poll && !refundsApi.isSettled(query.state.data) ? pollInterval : false),
    ...options,
  });

export function useCreateRefund(orderId, options = {}) {
  const qc = useQueryClient();
  const after = (refund) => {
    if (refund?.id) qc.setQueryData(qk.refunds.detail(refund.id), refund);
    // Đơn và vé đổi trạng thái ngay trong TX tạo refund, phải nạp lại chứ không chờ poll.
    qc.invalidateQueries({ queryKey: qk.orders.all });
    qc.invalidateQueries({ queryKey: qk.me.all });
  };
  return useMutation(
    withAfter({ mutationFn: ({ body, idempotencyKey }) => refundsApi.create(orderId, body, { idempotencyKey }), ...options }, after)
  );
}
