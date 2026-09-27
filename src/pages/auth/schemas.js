/*
 * Schema zod cho các form auth. Tên field khớp DTO BE (contract §4.2): trang chỉ cần bỏ
 * confirmPassword / agree (chỉ để kiểm tra ở FE) rồi gửi phần còn lại lên API.
 */
import { z, v, passwordsMatch } from "@/lib/forms";
import { isOrganizerRole } from "@/stores/auth";

// "Nhập lại mật khẩu" phải khớp "Mật khẩu"; lỗi gắn vào ô confirmPassword.
const match = passwordsMatch();
const confirm = z.string().min(1, { error: "Hãy nhập lại mật khẩu" });

export const loginSchema = z.object({
  email: v.email(),
  password: z.string().min(1, { error: "Mật khẩu là bắt buộc" }),
});

export const registerSchema = z
  .object({ fullName: v.required("Họ và tên"), email: v.email(), password: v.password(), confirmPassword: confirm })
  .refine(match.check, match.params);

export const organizerRegisterSchema = z
  .object({
    fullName: v.required("Họ và tên"),
    email: v.email(),
    password: v.password(),
    confirmPassword: confirm,
    organizerName: v.required("Tên ban tổ chức"),
    organizerDescription: v.text(5000, "Mô tả"),
    contactPhone: v.phone(),
    website: v.url("Website"),
    city: v.text(100, "Thành phố"),
    agree: z.boolean().refine((x) => x === true, { error: "Bạn cần đồng ý với điều khoản để tiếp tục" }),
  })
  .refine(match.check, match.params);

export const forgotSchema = z.object({ email: v.email() });

export const resetSchema = z
  .object({ password: v.password("Mật khẩu mới"), confirmPassword: confirm })
  .refine(match.check, match.params);

/** Sau đăng nhập: về trang đang dở (state.from), không có thì organizer → dashboard, còn lại → trang chủ. */
export const afterLoginPath = (from, user) => from || (isOrganizerRole(user) ? "/organizer" : "/");
