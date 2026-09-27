/**
 * Bộ component cho form (react-hook-form + zod). Dùng cho mọi form trong app:
 *   import { Field, FormRootError, SubmitButton } from "@/components/form";
 *
 *   Field          một ô nhập có nhãn + lỗi
 *   PasswordField  ô mật khẩu có nút hiện/ẩn (+ thước độ mạnh khi `strength`)
 *   CityInput      ô thành phố có gợi ý (dùng trong render của Field)
 *   FormSection    nhóm field có tiêu đề nhỏ + divider
 *   FormRootError  lỗi chung của form (root.server)
 *   SubmitButton   nút gửi có trạng thái đang xử lý
 *
 * Schema + đổ lỗi BE vào form: xem @/lib/forms (v, z, applyApiErrors, toPayload).
 */
export { Field } from "./Field";
export { PasswordField } from "./PasswordField";
export { CityInput } from "./CityInput";
export { FormSection } from "./FormSection";
export { FormRootError } from "./FormRootError";
export { SubmitButton } from "./SubmitButton";
