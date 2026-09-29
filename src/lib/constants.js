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
    REFUND_FAILED: ["Hoàn tiền lỗi", "destructive"],
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
  ADMIN_REJECTED: "Yêu cầu bị từ chối sau khi kiểm tra.",
};

export const statusLabel = (kind, status) => STATUS[kind]?.[status]?.[0] || status || "";

export const TICKET_HISTORY_LABEL = {
  ISSUED: "Phát hành",
};

export const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80";

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
