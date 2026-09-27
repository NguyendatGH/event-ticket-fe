/* Schema zod cho các form của khu tài khoản. Tên field khớp DTO BE (contract §4.2). */
import { z, v, passwordsMatch } from "@/lib/forms";

/** PUT /users/me: hồ sơ người dùng (khác organizerProfileSchema của trang hồ sơ ban tổ chức). */
export const userProfileSchema = z.object({
  fullName: v.required("Họ và tên"),
  phone: v.phone(),
  bio: v.text(500, "Giới thiệu"),
  avatarUrl: z.string().max(1000).optional().nullable(),
});

const match = passwordsMatch("confirmPassword", "newPassword");
/** PUT /users/me/password */
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Nhập mật khẩu hiện tại" }),
    newPassword: v.password("Mật khẩu mới"),
    confirmPassword: z.string().min(1, { error: "Hãy nhập lại mật khẩu mới" }),
  })
  .refine(match.check, match.params)
  .refine((d) => !d.currentPassword || d.newPassword !== d.currentPassword, {
    error: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

/** POST /me/organizer: nâng tài khoản khách thành ban tổ chức. */
export const becomeOrganizerSchema = z.object({
  name: v.required("Tên ban tổ chức"),
  description: v.text(5000, "Mô tả"),
  contactEmail: v.optionalEmail("Email liên hệ"),
  contactPhone: v.phone(),
  website: v.url("Website"),
  city: v.text(100, "Thành phố"),
  logoUrl: z.string().max(1000).optional().nullable(),
});

/** UserResponse → giá trị form hồ sơ (null → ""). */
export const profileDefaults = (user) => ({
  fullName: user?.fullName ?? "",
  phone: user?.phone ?? "",
  bio: user?.bio ?? "",
  avatarUrl: user?.avatarUrl ?? null,
});
