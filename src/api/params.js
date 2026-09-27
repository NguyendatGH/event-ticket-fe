/**
 * Bỏ tham số rỗng (undefined, null, "", mảng rỗng) trước khi gửi lên BE.
 *   cleanParams({ q: "", city: "Hà Nội", tags: [] })  →  { city: "Hà Nội" }
 * Vì sao: URL gọn hơn, và query key của TanStack Query ổn định ({q:""} và {} coi là một → không fetch trùng).
 */
export const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length)));
