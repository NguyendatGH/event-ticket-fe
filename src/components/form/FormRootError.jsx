import { useFormState } from "react-hook-form";
import { motion } from "motion/react";
import { messageIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Lỗi chung của form (errors.root.server, do applyApiErrors gán khi lỗi BE không thuộc field nào).
 *   <FormRootError form={form} />
 * Tự đăng ký useFormState cho riêng "root": khi lỗi đổi chỉ component này render lại,
 * form cha không cần theo dõi `errors`.
 */
export function FormRootError({ form, className }) {
  const { errors } = useFormState({ control: form.control, name: "root" });
  const message = errors.root?.server?.message;
  if (!message) return null;
  return (
    <motion.p key={message} {...messageIn} role="alert" className={cn("border-l-2 border-destructive py-1 pl-3 text-sm text-destructive", className)}>
      {message}
    </motion.p>
  );
}
