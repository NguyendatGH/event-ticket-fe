/**
 * Hằng số nghiệp vụ dùng chung. Phí dịch vụ và luật giá bán lại thật đọc từ BE qua useAppConfig()
 * (GET /api/v1/config, cấu hình ở application.yaml / .env của BE); các số dưới đây chỉ là giá trị
 * dự phòng lúc config chưa tải xong. BE luôn kiểm tra lại và là nơi quyết định cuối cùng.
 */

/**
 * Phí dịch vụ mỗi đơn, dự phòng (BE app.checkout.fee mặc định 12000). Trang dùng useAppConfig().checkoutFee.
 * Chỉ để hiển thị ước tính trước khi tạo đơn; số thật luôn lấy từ order.feeAmount BE trả về.
 */
export const SERVICE_FEE = 12000;

/** Giá bán lại tối thiểu, dự phòng (BE app.resale.min-price mặc định 10000). Trang dùng useAppConfig().resaleMinPrice. */
export const RESALE_MIN_PRICE = 10_000;

/** Đóng bán lại khi sự kiện còn <= 2 giờ nữa là bắt đầu, dự phòng (BE app.resale.cutoff-hours). */
export const RESALE_CUTOFF_HOURS = 2;

/**
 * Số vé tối đa chọn được cho một hạng vé = min(tối đa mỗi đơn, số vé còn lại).
 * BE luôn gửi maxPerOrder; giá trị 10 chỉ là dự phòng khi thiếu dữ liệu.
 */
export function tierLimit(tier) {
  const maxPerOrder = Number(tier?.maxPerOrder ?? 10);
  const available = Number(tier?.available ?? 0);
  return Math.max(0, Math.min(maxPerOrder, available));
}
