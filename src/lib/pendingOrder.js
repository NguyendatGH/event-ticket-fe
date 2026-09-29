// Nhớ "đơn đang chờ thanh toán" trong lúc người dùng ở cổng thanh toán.

const PENDING_ORDER_KEY = "nhip.pendingOrder";

export function rememberPendingOrder(orderId) {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
  } catch {
    // storage bị chặn: bỏ qua
  }
}

export function readPendingOrder() {
  try {
    return sessionStorage.getItem(PENDING_ORDER_KEY) || "";
  } catch {
    return "";
  }
}

export function clearPendingOrder() {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    // storage bị chặn: bỏ qua
  }
}
