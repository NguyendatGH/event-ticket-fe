import { z } from "zod";
import { formatNumber } from "@/lib/format";

z.config(z.locales.vi());

export { z };

const PHONE = /^[0-9+ .-]{8,20}$/;

const optional = (schema) => z.union([z.literal(""), schema]).optional().nullable();

export const v = {
  required: (label = "Trường này", max = 200) =>
    z
      .string({ error: `${label} là bắt buộc` })
      .trim()
      .min(1, { error: `${label} là bắt buộc` })
      .max(max, { error: `${label} tối đa ${max} ký tự` }),

  text: (max = 200, label = "Nội dung") =>
    optional(z.string().trim().max(max, { error: `${label} tối đa ${max} ký tự` })),

  email: (label = "Email") =>
    z
      .string({ error: `${label} là bắt buộc` })
      .trim()
      .min(1, { error: `${label} là bắt buộc` })
      .pipe(z.email({ error: `${label} không hợp lệ` })),

  optionalEmail: (label = "Email") => optional(z.string().trim().pipe(z.email({ error: `${label} không hợp lệ` }))),

  password: (label = "Mật khẩu") =>
    z
      .string({ error: `${label} là bắt buộc` })
      .min(8, { error: `${label} tối thiểu 8 ký tự` })
      .max(72, { error: `${label} tối đa 72 ký tự` }),

  phone: (label = "Số điện thoại") =>
    optional(z.string().trim().regex(PHONE, { error: `${label} không hợp lệ` })),

  url: (label = "Đường dẫn") =>
    optional(
      z
        .string()
        .trim()
        .regex(/^https?:\/\/\S+$/i, { error: `${label} phải bắt đầu bằng http:// hoặc https://` })
        .max(1000, { error: `${label} quá dài` })
    ),

  int: (label = "Giá trị", { min, max } = {}) => {
    let s = z.coerce.number({ error: `${label} phải là số` }).int({ error: `${label} phải là số nguyên` });
    if (min != null) s = s.min(min, { error: `${label} tối thiểu ${formatNumber(min)}` });
    if (max != null) s = s.max(max, { error: `${label} tối đa ${formatNumber(max)}` });
    return s;
  },
};

export const passwordsMatch = (field = "confirmPassword", source = "password") => ({
  check: (data) => data[field] === data[source],
  params: { error: "Mật khẩu nhập lại không khớp", path: [field] },
});

export const toFormPath = (field) => String(field).replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "");

export function applyApiErrors(form, error, { root = true, codeFields = {} } = {}) {
  const fieldErrors = Array.isArray(error?.errors) ? error.errors.filter((e) => e && e.field) : [];
  if (fieldErrors.length > 0) {
    fieldErrors.forEach((e, i) => {
      form.setError(toFormPath(e.field), { type: "server", message: e.message }, { shouldFocus: i === 0 });
    });
    return fieldErrors.length;
  }

  const codeField = codeFields[error?.code];
  if (codeField) {
    form.setError(codeField, { type: "server", message: error.message }, { shouldFocus: true });
    return 1;
  }

  if (root) {
    form.setError("root.server", { type: "server", message: error?.message || "Có lỗi xảy ra. Thử lại." });
  }
  return 0;
}

export function toPayload(values) {
  if (Array.isArray(values)) return values.map(toPayload);
  if (values && typeof values === "object" && !(values instanceof Date) && !(values instanceof File)) {
    return Object.fromEntries(Object.entries(values).map(([k, val]) => [k, toPayload(val)]));
  }
  if (typeof values === "string") return values.trim() === "" ? null : values;
  return values;
}
