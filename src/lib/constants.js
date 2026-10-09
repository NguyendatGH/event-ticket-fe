// Hằng số dùng chung. Nhãn tiếng Việt cho mọi enum BE (contract §1, §3).

export const BRAND = {
  name: "Encore",
  wordmark: "ENCORE",
  tagline: "Vé cho những khoảnh khắc đáng nhớ.",
  supportEmail: "hotro@encore.vn",
  supportHours: "Thứ hai - thứ sáu, 9:00-18:00",
};

export const CATEGORIES = [
  { slug: "music", label: "Âm nhạc" },
  { slug: "theatre", label: "Sân khấu" },
  { slug: "sport", label: "Thể thao" },
  { slug: "conference", label: "Hội thảo" },
  { slug: "exhibition", label: "Triển lãm" },
  { slug: "workshop", label: "Workshop" },
];
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));
export const categoryLabel = (slug) => CATEGORY_LABEL[slug] || slug || "";

export const CITIES = ["Hà Nội", "TP.HCM", "Đà Nẵng"];

export const EVENT_SORTS = [
  { value: "date", label: "Ngày gần nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "newest", label: "Mới đăng" },
  { value: "price", label: "Giá thấp đến cao" },
  { value: "-price", label: "Giá cao đến thấp" },
  { value: "-date", label: "Ngày xa nhất" },
];

export const WHEN_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "weekend", label: "Cuối tuần" },
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
];

export const DASHBOARD_INTERVALS = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

export const STATUS = {
  event: {
    PUBLISHED: ["Đang bán", "default"],
    UPCOMING: ["Sắp mở bán", "info"],
    SOLD_OUT: ["Hết vé", "warning"],
    ENDED: ["Đã kết thúc", "muted"],
    DRAFT: ["Bản nháp", "outline"],
    CANCELLED: ["Đã hủy", "destructive"],
  },
  order: {
    PENDING_PAYMENT: ["Chờ thanh toán", "warning"],
    PAID: ["Đã thanh toán", "default"],
    REFUND_PROCESSING: ["Đang hoàn tiền", "info"],
    REFUNDED: ["Đã hoàn tiền", "muted"],
    PARTIALLY_REFUNDED: ["Hoàn tiền một phần", "info"],
    // Một trạng thái BE, hai câu chuyện: hoàn tiền chạy không xong THẬT, và BTC chủ động hủy yêu cầu.
    // Nên nhãn phải trung tính cho cả hai, và tone warning (không phải destructive) vì vé đã về ACTIVE,
    // khách vẫn dùng vé được hoặc gửi lại yêu cầu hoàn được — không có gì hỏng để khách phải lo.
    REFUND_FAILED: ["Chưa hoàn được tiền", "warning"],
    EXPIRED: ["Hết hạn", "muted"],
    CANCELLED: ["Đã hủy", "muted"],
    MANUAL_REVIEW: ["Đang đối soát", "warning"],
  },
  payment: {
    CREATED: ["Đã tạo", "outline"],
    PENDING: ["Chờ thanh toán", "warning"],
    PAID: ["Đã thanh toán", "default"],
    UNDERPAID: ["Thiếu tiền", "destructive"],
    PAID_LATE: ["Thanh toán trễ", "warning"],
    FAILED: ["Thất bại", "destructive"],
    EXPIRED: ["Hết hạn", "muted"],
  },
  ticket: {
    ACTIVE: ["Hợp lệ", "default"],
    REFUND_PENDING: ["Chờ hoàn tiền", "warning"],
    REFUNDED: ["Đã hoàn tiền", "muted"],
  },
  refund: {
    REQUESTED: ["Đã tiếp nhận", "warning"],
    AWAITING_FUNDS: ["Đang chờ nguồn tiền", "warning"],
    PROCESSING: ["Đang chuyển tiền", "info"],
    SUCCEEDED: ["Đã hoàn tiền", "default"],
    FAILED: ["Hoàn tiền thất bại", "destructive"],
    MANUAL_REVIEW: ["Chờ duyệt thủ công", "warning"],
  },
};

/** Lý do refund không tự chạy mà chờ người xử lý, viết lại cho khách hiểu. */
export const REFUND_FAILURE_LABEL = {
  PAYOUT_DISABLED: "Kênh chuyển tiền đang tạm dừng, ban tổ chức sẽ chuyển khoản thủ công.",
  PAYOUT_UNAVAILABLE: "Chưa kết nối được cổng chuyển tiền, ban tổ chức sẽ chuyển khoản thủ công.",
  INSUFFICIENT_PAYOUT_BALANCE: "Đang chờ đủ nguồn tiền để chuyển, yêu cầu của bạn vẫn giữ nguyên thứ tự.",
  PROCESSING_TIMEOUT: "Ngân hàng chưa phản hồi, ban tổ chức đang kiểm tra.",
  INVALID_DESTINATION:
    "Không chuyển được tiền tới ngân hàng / số tài khoản này. Tiền chưa bị trừ và vé vẫn dùng được; hãy gửi yêu cầu mới với tài khoản khác.",
  ADMIN_REJECTED: "Yêu cầu bị từ chối sau khi kiểm tra.",
  CANCELLED_BY_ORGANIZER:
    "Ban tổ chức đã hủy yêu cầu hoàn tiền này. Vé của bạn vẫn dùng được bình thường; nếu vẫn muốn hoàn, hãy liên hệ ban tổ chức rồi gửi yêu cầu mới.",
};

/**
 * Cùng mã lý do, nhưng viết cho BAN TỔ CHỨC đọc (trang /organizer/refunds): họ là người phải làm gì đó,
 * nên câu chữ nói rõ việc cần làm. REFUND_FAILURE_LABEL ở trên là bản viết cho khách.
 * Mã lấy từ BE: RefundService (INSUFFICIENT_PAYOUT_BALANCE, AWAITING_FUNDS_TIMEOUT, PROCESSING_TIMEOUT...)
 * và Refund.holdForDestinationReview (DESTINATION_REVIEW).
 */
export const REFUND_FAILURE_ORG_LABEL = {
  INSUFFICIENT_PAYOUT_BALANCE: "Ví chi không đủ tiền. Nạp thêm vào ví chi là hệ thống tự gửi lại.",
  AWAITING_FUNDS_TIMEOUT: "Chờ ví đủ tiền quá lâu nên hệ thống dừng tự động. Cần chuyển khoản tay.",
  PAYOUT_DISABLED: "Kênh chi tự động đang tắt trong cấu hình. Mọi yêu cầu phải chuyển khoản tay.",
  PAYOUT_UNAVAILABLE: "Không gọi được cổng chi trả. Tiền CHƯA bị trừ, chuyển khoản tay rồi chốt.",
  PROCESSING_TIMEOUT: "Cổng chưa trả kết quả. Lệnh có thể VẪN đang chạy — kiểm tra dashboard PayOS trước khi chốt.",
  LIMIT_EXCEEDED: "Vượt hạn mức chi của cổng. Chờ qua hạn mức hoặc chuyển khoản tay.",
  INVALID_DESTINATION: "Ngân hàng / số tài khoản nhận không hợp lệ. Liên hệ khách lấy lại thông tin.",
  DESTINATION_REVIEW: "Khách xin hoàn về tài khoản khác tài khoản đã thanh toán, cần bạn duyệt.",
  ADMIN_REJECTED: "Đã bị từ chối sau khi kiểm tra.",
  CANCELLED_BY_ORGANIZER: "Bạn đã hủy yêu cầu này. Vé đã được trả lại trạng thái hợp lệ cho khách.",
};

/** Nhãn phương thức thanh toán cho người dùng (BTC chọn, khách bấm). Mã khớp enum PaymentMethod của gateway. */
export const PAYMENT_METHOD_LABEL = {
  CARD: "Thẻ ngân hàng",
  QR: "QR / VietQR",
  PAYNOW: "PayNow",
  GOOGLE_PAY: "Google Pay",
  APPLE_PAY: "Apple Pay",
  WALLET: "Ví Encore",
};

export const paymentMethodLabel = (method) => PAYMENT_METHOD_LABEL[method] || method;

/**
 * Chú thích "ngân hàng này mô phỏng giống acquirer mẫu nào" (cổng BankSim). Mock bank chỉ có HAI kiểu xử lý thẻ và gateway
 * chọn kiểu theo cờ 3DS của ngân hàng, không theo tên (CardBankRouter): có 3DS = như bank-a, không 3DS = như bank-b.
 * QR / ví không gọi mock bank: khách bấm xác nhận trên trang của cổng là xong.
 * Mỗi giá trị là [nhãn ngắn cạnh tên ngân hàng, câu giải thích cách thử].
 */
export const MOCK_BANK_PROFILE = {
  A: ["bank profile A", "Thẻ đi mock bank kiểu bank-a (có 3DS): thẻ đuôi 1000 hỏi OTP 123456, đuôi 2000 duyệt thẳng, số khác bị từ chối."],
  B: ["bank profile B", "Thẻ đi mock bank kiểu bank-b (không 3DS): thẻ đuôi 1000 được duyệt ngay, số khác bị từ chối."],
  QR: ["chỉ QR / ví", "Không nhận thẻ, không qua mock bank."],
};

export const mockBankProfile = (bank) =>
  MOCK_BANK_PROFILE[!bank?.paymentMethods?.includes("CARD") ? "QR" : bank.threeDsSupported ? "A" : "B"];

export const statusLabel = (kind, status) => STATUS[kind]?.[status]?.[0] || status || "";

/**
 * Mã BE ghi vào failureCode khi BTC HỦY một yêu cầu hoàn tiền.
 * BE cố ý KHÔNG thêm RefundStatus mới (bảng refunds có check constraint), nên refund bị hủy vẫn
 * mang status = "FAILED". Vì vậy FE phải tự nhận ra ca này: "Hoàn tiền thất bại" đọc lên là sự cố
 * kỹ thuật, còn đây là quyết định chủ động của BTC — sai nghĩa hẳn với cả BTC lẫn khách.
 */
export const REFUND_CANCELLED_CODE = "CANCELLED_BY_ORGANIZER";

export const isRefundCancelled = (refund) =>
  refund?.status === "FAILED" && refund?.failureCode === REFUND_CANCELLED_CODE;

/**
 * [nhãn, tone] để vẽ badge cho MỘT refund — khác statusLabel("refund", status) ở chỗ nó nhìn cả
 * failureCode. Gom điều kiện "đã hủy" vào đúng một chỗ, để không phải rải `if` ở từng component.
 * Tone muted (nhạt) chứ không destructive: hủy là việc BTC chủ động làm, không phải lỗi hệ thống.
 */
export const refundStatusBadge = (refund) =>
  isRefundCancelled(refund) ? ["Đã hủy", "muted"] : STATUS.refund[refund?.status] || [refund?.status || "", "outline"];

/**
 * Lý do một refund đang chờ người xử lý (hoặc đã bị hủy), ưu tiên câu dành cho BTC rồi mới tới câu BE trả về.
 * Ngoại lệ: refund bị BTC hủy thì failureReason CHÍNH LÀ ghi chú BTC đã nhập — BE lưu nguyên văn,
 * không thêm tiền tố nào — nên hiện thẳng nó, hữu ích hơn một câu mô tả chung.
 */
export const refundReasonForOrganizer = (refund) =>
  (isRefundCancelled(refund) ? refund.failureReason : null) ||
  REFUND_FAILURE_ORG_LABEL[refund?.failureCode] ||
  refund?.failureReason ||
  refund?.failureCode ||
  "";

export const TICKET_HISTORY_LABEL = {
  ISSUED: "Phát hành",
};

export const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80";

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
