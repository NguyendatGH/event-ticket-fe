/* Hàm thuần của khu sự kiện: trạng thái mua vé, tổng tiền giỏ, link sang checkout, mô tả. */
import { SERVICE_FEE } from "@/lib/business";

/** Trạng thái sự kiện → có mua được không + nhãn nút. */
export function purchaseState(status) {
  switch (status) {
    case "PUBLISHED":
      return { open: true, cta: "Mua vé" };
    case "UPCOMING":
      return {
        open: false,
        cta: "Sắp mở bán",
        note: "Vé chưa mở bán. Giá vé bên dưới để bạn tham khảo trước.",
      };
    case "SOLD_OUT":
      return {
        open: false,
        cta: "Đã hết vé",
        note: "Tất cả hạng vé đã bán hết.",
      };
    case "ENDED":
      return {
        open: false,
        cta: "Sự kiện đã kết thúc",
        note: "Sự kiện đã diễn ra, không còn bán vé.",
      };
    case "CANCELLED":
      return {
        open: false,
        cta: "Sự kiện đã hủy",
        note: "Ban tổ chức đã hủy sự kiện này.",
      };
    default:
      return { open: false, cta: "Chưa mở bán" };
  }
}

/** Tổng hợp giỏ: dòng đã chọn, tạm tính, phí, tổng. */
export function summarize(tiers = [], quantities = {}, serviceFee = SERVICE_FEE) {
  const lines = tiers
    .filter((t) => (quantities[t.id] ?? 0) > 0)
    .map((t) => ({
      id: t.id,
      name: t.name,
      quantity: quantities[t.id],
      amount: quantities[t.id] * t.price,
    }));
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  // Phí chỉ để hiển thị ước tính; số thật lấy từ order.feeAmount BE trả về sau khi tạo đơn
  const fee = count > 0 ? serviceFee : 0;
  return { lines, count, subtotal, fee, total: subtotal + fee };
}

/** /checkout/:slug?tiers=<tierId>:<qty>,… (contract §6.2) */
export const checkoutHref = (slug, lines) =>
  `/checkout/${slug}?tiers=${lines.map((l) => `${l.id}:${l.quantity}`).join(",")}`;

/** Mô tả sự kiện → mảng đoạn văn. BE trả mảng; dữ liệu cũ có thể là một chuỗi hoặc trống. */
export function toParagraphs(description) {
  if (Array.isArray(description)) return description;
  return description ? [description] : [];
}
