import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as orgRefundsApi from "../services/organizerRefunds";
import { qk } from "./keys";
import { withAfter } from "./withAfter";

const POLL_MS = 5000;

const invalidateLists = (qc) =>
  qc.invalidateQueries({ queryKey: qk.organizer.refunds.all, predicate: (q) => q.queryKey[2] === "list" });

export const useOrganizerRefunds = (status, { poll = true, pollInterval = POLL_MS, ...options } = {}) =>
  useQuery({
    queryKey: qk.organizer.refunds.list(status),
    queryFn: () => orgRefundsApi.list(status),
    refetchInterval: (query) => (poll && orgRefundsApi.hasRunning(query.state.data) ? pollInterval : false),
    ...options,
  });

export const useRefundInstruction = (id, options = {}) =>
  useQuery({
    queryKey: qk.organizer.refunds.instruction(id),
    queryFn: () => orgRefundsApi.instruction(id),
    enabled: Boolean(id),
    ...options,
  });

/**
 * Chốt một refund: SUCCEEDED / FAILED / RETRY, và CANCELLED (BTC hủy hẳn yêu cầu).
 * Cùng một mutation cho cả bốn vì BE cùng một endpoint POST /organizer/refunds/{id}/resolve,
 * và cache phải nạp lại y như nhau — đừng tạo hook riêng cho việc hủy.
 */
export function useResolveRefund(options = {}) {
  const qc = useQueryClient();
  const after = (refund) => {
    invalidateLists(qc);
    qc.invalidateQueries({ queryKey: qk.orders.all });
    qc.invalidateQueries({ queryKey: qk.refunds.all });
    qc.invalidateQueries({ queryKey: qk.organizer.dashboard.all });
    qc.invalidateQueries({ queryKey: qk.organizer.wallet });
    qc.invalidateQueries({ queryKey: qk.me.all });
    if (refund?.id) qc.setQueryData(qk.refunds.detail(refund.id), refund);
  };
  return useMutation(withAfter({ mutationFn: ({ id, body }) => orgRefundsApi.resolve(id, body), ...options }, after));
}

export function useRefreshOrganizerRefunds() {
  const qc = useQueryClient();
  return () => invalidateLists(qc);
}
