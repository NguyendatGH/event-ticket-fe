// Bỏ tham số rỗng (undefined, null, "", mảng rỗng) trước khi gửi lên BE.

export const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length)));
