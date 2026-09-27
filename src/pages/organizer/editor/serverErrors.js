import { applyApiErrors, toFormPath } from "@/lib/forms";

/**
 * Lỗi validate từ BE → field của form trình sửa sự kiện.
 *
 * Vì sao cần bước chuẩn hóa: tên field BE gửi về theo request (EventUpsertRequest), không trùng hẳn tên field
 * trong form. Ví dụ description là MẢNG đoạn văn ở BE ("description[1]") nhưng là MỘT ô textarea trong form;
 * lỗi "tiers" (cả danh sách) phải hiện ở "tiers.root" vì react-hook-form không gắn lỗi vào chính mảng.
 */

/** "tiers[0].price" → "tiers.0.price"; "description[2]" → "description"; "tiers" → "tiers.root". */
export function normalizeServerField(field) {
  const f = toFormPath(field || "");
  if (/^description(\.\d+)?$/.test(f)) return "description";
  if (f === "tiers") return "tiers.root";
  if (f === "venue") return "venue.name";
  if (/^schedule\.\d+$/.test(f)) return `${f}.title`;
  return f;
}

/**
 * Chuẩn hóa field lỗi BE rồi đổ vào form (applyApiErrors, không đặt lỗi chung root: trang tự toast).
 * Trả về path đầu tiên để trang nhảy tới đúng bước + focus ô đó; null khi lỗi không gắn field nào.
 */
export function applyServerErrors(form, err) {
  const errors = (err?.errors || []).filter((e) => e?.field).map((e) => ({ ...e, field: normalizeServerField(e.field) }));
  applyApiErrors(form, { ...err, errors }, { root: false });
  return errors[0]?.field ?? null;
}
