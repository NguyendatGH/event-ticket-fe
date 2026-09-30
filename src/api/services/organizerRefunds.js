// Hoàn tiền phía ban tổ chức (BE: OrganizerRefundController, base /api/v1/organizer/refunds).
// BTC là người duyệt vì tiền nằm ở tài khoản nhận của BTC, không phải của sàn.

import { client } from "../client";
import { cleanParams } from "../params";

/** Bỏ trống status = BE trả TẤT CẢ, mới nhất trước. status là một RefundStatus. */
export const list = (status) => client.get("/organizer/refunds", { params: cleanParams({ status }) });

/** Thông tin chuyển khoản tay (QR VietQR). 409 REFUND_DESTINATION_UNKNOWN nếu refund chưa có đích hợp lệ. */
export const instruction = (id) => client.get(`/organizer/refunds/${id}/instruction`);

/**
 * body: { outcome: "SUCCEEDED" | "FAILED" | "RETRY" | "CANCELLED", note }.
 * SUCCEEDED/FAILED/RETRY: chỉ hợp lệ khi refund đang MANUAL_REVIEW.
 * CANCELLED (BTC hủy hẳn yêu cầu): hợp lệ khi AWAITING_FUNDS hoặc MANUAL_REVIEW, `note` BẮT BUỘC
 * (thiếu → 400), và bị chặn 409 REFUND_ALREADY_AT_PROVIDER nếu cổng đã nhận lệnh chi.
 * Sau khi hủy, refund về status=FAILED + failureCode=CANCELLED_BY_ORGANIZER và vé khách về ACTIVE.
 */
export const resolve = (id, body) => client.post(`/organizer/refunds/${id}/resolve`, body);

/**
 * Trạng thái "tiền đang đi": job nền của BE sẽ tự đổi sang trạng thái khác, FE chỉ thấy nếu hỏi lại.
 * Còn SUCCEEDED/FAILED/MANUAL_REVIEW chỉ đổi khi có người bấm — poll thêm chỉ đốt request vô ích.
 */
export const RUNNING_STATUSES = ["REQUESTED", "AWAITING_FUNDS", "PROCESSING"];

export const hasRunning = (refunds) =>
  Array.isArray(refunds) && refunds.some((r) => RUNNING_STATUSES.includes(r?.status));
