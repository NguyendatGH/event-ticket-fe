const PENDING_ORDER_KEY = "nhip.pendingOrder";

export function rememberPendingOrder(orderId) {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
  } catch (error) {
    void error;
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
  } catch (error) {
    void error;
  }
}
