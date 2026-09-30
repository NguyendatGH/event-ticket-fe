// Hook hoàn tiền phía BTC: danh sách (có poll), hướng dẫn chuyển khoản tay, chốt kết quả.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as orgRefundsApi from "../services/organizerRefunds";
import { qk } from "./keys";
import { withAfter } from "./withAfter";

const POLL_MS = 5000;

/** Chỉ nạp lại các query "list" trong nhóm organizer.refunds (không đụng tới instruction). */
const invalidateLists = (qc) =>
  qc.invalidateQueries({ queryKey: qk.organizer.refunds.all, predicate: (q) => q.queryKey[2] === "list" });

/**
 * status = undefined → lấy tất cả refund của BTC.
 * Poll chỉ khi trong danh sách còn ít nhất một refund đang chạy (REQUESTED/AWAITING_FUNDS/PROCESSING):
 * tiền đi bất đồng bộ nên trạng thái đổi ở BE mà FE không hay; khi tất cả đã "đứng yên"
 * (SUCCEEDED/FAILED/MANUAL_REVIEW) thì hỏi lại mỗi 5s chỉ tốn request chứ không có gì mới.
 * `refetchInterval` nhận function để đọc được dữ liệu hiện tại qua query.state.data.
 */
export const useOrganizerRefunds = (status, { poll = true, pollInterval = POLL_MS, ...options } = {}) =>
  useQuery({
    queryKey: qk.organizer.refunds.list(status),
    queryFn: () => orgRefundsApi.list(status),
    refetchInterval: (query) => (poll && orgRefundsApi.hasRunning(query.state.data) ? pollInterval : false),
    ...options,
  });

/** QR + số tài khoản để BTC chuyển khoản tay. Lỗi 409 REFUND_DESTINATION_UNKNOWN là lỗi dữ liệu, không retry. */
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
    // Chỉ nạp lại DANH SÁCH. Hướng dẫn chuyển khoản không cần nạp lại: refund chốt rồi thì
    // BE trả 409 cho endpoint đó, mà dialog cũng đóng ngay sau khi chốt.
    invalidateLists(qc);
    // Đơn và vé của khách đổi trạng thái trong cùng transaction chốt refund, và số liệu dashboard cũng đổi.
    qc.invalidateQueries({ queryKey: qk.orders.all });
    qc.invalidateQueries({ queryKey: qk.refunds.all });
    qc.invalidateQueries({ queryKey: qk.organizer.dashboard.all });
    // Vé đổi trạng thái theo (CANCELLED/FAILED → vé về ACTIVE, SUCCEEDED → REFUNDED) nên bỏ luôn
    // cache "của tôi": BTC cũng là người dùng bình thường, vẫn có thể đang mở trang vé của mình.
    qc.invalidateQueries({ queryKey: qk.me.all });
    if (refund?.id) qc.setQueryData(qk.refunds.detail(refund.id), refund);
  };
  return useMutation(withAfter({ mutationFn: ({ id, body }) => orgRefundsApi.resolve(id, body), ...options }, after));
}

/**
 * Nạp lại danh sách refund của BTC theo yêu cầu. Dùng khi biết dữ liệu trên màn đã cũ mà không
 * có mutation nào thành công để tự nạp lại — ví dụ BE trả 409 vì yêu cầu đã được chốt ở tab khác.
 */
export function useRefreshOrganizerRefunds() {
  const qc = useQueryClient();
  return () => invalidateLists(qc);
}
