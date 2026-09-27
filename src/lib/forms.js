import { z } from "zod";
import { formatNumber } from "@/lib/format";

/**
 * Helper form: schema zod với thông điệp tiếng Việt + đổ lỗi từ BE (ApiError.errors) vào react-hook-form.
 *
 *   const schema = z.object({ email: v.email(), password: v.password(), phone: v.phone() });
 *   const form = useForm({ resolver: zodResolver(schema), defaultValues });
 *   mutation.mutate(toPayload(values), { onError: (e) => applyApiErrors(form, e) });
 *
 * Component hiển thị field/lỗi/nút gửi nằm ở @/components/form.
 */

// Thông điệp mặc định tiếng Việt cho schema không tự đặt message.
z.config(z.locales.vi());

export { z };

const PHONE = /^[0-9+ .-]{8,20}$/;

/** Chuỗi rỗng ("" từ input trống) được coi là không nhập. */
const optional = (schema) => z.union([z.literal(""), schema]).optional().nullable();

export const v = {
  /** Bắt buộc, cắt khoảng trắng, tối đa `max` ký tự. */
  required: (label = "Trường này", max = 200) =>
    z
      .string({ error: `${label} là bắt buộc` })
      .trim()
      .min(1, { error: `${label} là bắt buộc` })
      .max(max, { error: `${label} tối đa ${max} ký tự` }),

  /** Không bắt buộc, tối đa `max` ký tự. */
  text: (max = 200, label = "Nội dung") =>
    optional(z.string().trim().max(max, { error: `${label} tối đa ${max} ký tự` })),

  email: (label = "Email") =>
    z
      .string({ error: `${label} là bắt buộc` })
      .trim()
      .min(1, { error: `${label} là bắt buộc` })
      .pipe(z.email({ error: `${label} không hợp lệ` })),

  optionalEmail: (label = "Email") => optional(z.string().trim().pipe(z.email({ error: `${label} không hợp lệ` }))),

  /** Mật khẩu 8-72 ký tự (giới hạn bcrypt phía BE). */
  password: (label = "Mật khẩu") =>
    z
      .string({ error: `${label} là bắt buộc` })
      .min(8, { error: `${label} tối thiểu 8 ký tự` })
      .max(72, { error: `${label} tối đa 72 ký tự` }),

  /** Số điện thoại không bắt buộc, cùng regex với BE. */
  phone: (label = "Số điện thoại") =>
    optional(z.string().trim().regex(PHONE, { error: `${label} không hợp lệ` })),

  /** URL http/https không bắt buộc. */
  url: (label = "Đường dẫn") =>
    optional(
      z
        .string()
        .trim()
        .regex(/^https?:\/\/\S+$/i, { error: `${label} phải bắt đầu bằng http:// hoặc https://` })
        .max(1000, { error: `${label} quá dài` })
    ),

  /** Số nguyên (input type=number trả chuỗi → coerce). */
  int: (label = "Giá trị", { min, max } = {}) => {
    let s = z.coerce.number({ error: `${label} phải là số` }).int({ error: `${label} phải là số nguyên` });
    if (min != null) s = s.min(min, { error: `${label} tối thiểu ${formatNumber(min)}` });
    if (max != null) s = s.max(max, { error: `${label} tối đa ${formatNumber(max)}` });
    return s;
  },
};

/** Nhập lại mật khẩu: dùng với .refine ở object schema. */
export const passwordsMatch = (field = "confirmPassword", source = "password") => ({
  check: (data) => data[field] === data[source],
  params: { error: "Mật khẩu nhập lại không khớp", path: [field] },
});

/** "tiers[0].price" → "tiers.0.price" (định dạng path của react-hook-form). */
export const toFormPath = (field) => String(field).replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "");

/**
 * Đổ lỗi BE (ApiError) vào react-hook-form. Đây là cách DUY NHẤT để hiện lỗi BE trên form.
 * Trả về số field đã gán lỗi (0 = không gán được field nào).
 *
 * Thứ tự xử lý:
 *   1. BE gửi errors[] (lỗi validate từng field) → gán vào đúng field, focus field đầu tiên.
 *   2. Không có errors[] nhưng mã lỗi nằm trong `codeFields` → gán message vào field đó.
 *      Ví dụ EMAIL_ALREADY_USED không có errors[] nhưng rõ ràng là lỗi của ô email:
 *        applyApiErrors(form, err, { codeFields: { EMAIL_ALREADY_USED: "email" } })
 *   3. Còn lại → lỗi chung `root.server` (hiện bằng <FormRootError form={form} />).
 *      Truyền { root: false } nếu trang muốn tự xử lý lỗi chung (vd hiện toast).
 */
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

/** Đổi "" → null (đệ quy) trước khi gửi BE, để field không nhập không bị validate như chuỗi rỗng. */
export function toPayload(values) {
  if (Array.isArray(values)) return values.map(toPayload);
  if (values && typeof values === "object" && !(values instanceof Date) && !(values instanceof File)) {
    return Object.fromEntries(Object.entries(values).map(([k, val]) => [k, toPayload(val)]));
  }
  // Không trim giá trị (mật khẩu có thể có khoảng trắng); schema zod tự .trim() ở field cần.
  if (typeof values === "string") return values.trim() === "" ? null : values;
  return values;
}
