/**
 * Component chỉ dùng cho các trang đăng nhập / đăng ký / quên mật khẩu.
 * Ô nhập, lỗi form, nút gửi dùng chung nằm ở @/components/form.
 */
import { staggerOf } from "@/lib/motion";

export { AuthHeading } from "./AuthHeading";
export { AuthFooter } from "./AuthFooter";

/**
 * Stagger cho cột form auth: tiêu đề → từng field → nút → chân trang lần lượt trồi lên, cách nhau 50ms.
 * Dùng: <motion.div variants={AUTH_STAGGER} initial="hidden" animate="show">; con dùng variants={riseSm}.
 */
export const AUTH_STAGGER = staggerOf(0.05, 0.02);
