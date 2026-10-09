// Kiểm trước ở FE đúng các quy tắc gateway dùng lúc lưu terminal (TerminalService.validateRoutes), để admin thấy
// lý do ngay trên form thay vì bấm Lưu rồi mới nhận 409.

/**
 * Terminal bắt buộc 3DS thì route CARD phải có ÍT NHẤT một acquirer có 3DS: acquirer không có 3DS duyệt thẻ thẳng,
 * chủ thẻ không bị hỏi OTP. Trả về mã acquirer của route CARD khi không acquirer nào có 3DS (gateway sẽ từ chối với
 * ACQUIRER_3DS_NOT_SUPPORTED), ngược lại trả mảng rỗng. Chưa tải xong danh sách acquirer thì chưa báo.
 */
export function cardRoutesWithout3ds({ methods, policy, routes, acquirers }) {
  if (!methods.includes("CARD") || policy !== "REQUIRED" || !Array.isArray(acquirers)) return [];
  const card = (routes?.CARD ?? []).map((r) => r.acquirerCode);
  const with3ds = new Set(acquirers.filter((a) => a.threeDsSupported).map((a) => a.code));
  return card.length > 0 && !card.some((code) => with3ds.has(code)) ? card : [];
}
