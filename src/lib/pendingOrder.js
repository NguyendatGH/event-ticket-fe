/**
 * Nhớ "đơn đang chờ thanh toán" trong lúc người dùng ở cổng thanh toán.
 *
 * Vì sao cần: cổng thanh toán quay về /checkout/return nhưng không phải lúc nào cũng kèm ?orderId=,
 * nên trước khi rời trang ta ghi id đơn lại, trang return đọc ra để biết đang chờ đơn nào.
 *
 * Vì sao sessionStorage (không phải localStorage): chỉ sống trong tab hiện tại và mất khi đóng tab,
 * nên hai tab mua hai đơn khác nhau không giẫm lên nhau, và không để lại rác lâu dài.
 *
 * Vì sao try/catch: trình duyệt có thể chặn storage (chế độ riêng tư, chặn cookie). Khi đó
 * ta bỏ qua lỗi; URL return vẫn còn ?orderId= nên luồng thanh toán không hỏng.
 */

const PENDING_ORDER_KEY = "nhip.pendingOrder";

/** Ghi id đơn trước khi chuyển sang cổng thanh toán. */
export function rememberPendingOrder(orderId) {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
  } catch {
    // storage bị chặn: bỏ qua (xem ghi chú đầu file)
  }
}

/** Đọc id đơn đang chờ; "" nếu không có. */
export function readPendingOrder() {
  try {
    return sessionStorage.getItem(PENDING_ORDER_KEY) || "";
  } catch {
    return "";
  }
}

/** Xóa sau khi đã biết kết quả đơn, để lần mua sau không đọc nhầm đơn cũ. */
export function clearPendingOrder() {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    // storage bị chặn: bỏ qua
  }
}
