import { motion } from "motion/react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messageIn, riseSm } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Một ô của form react-hook-form: nhãn trên, ô nhập, gợi ý, lỗi.
 *   <Field control={form.control} name="email" label="Email" type="email" autoComplete="email" />
 *   <Field … render={(field) => <Textarea {...field} />} />   // ô nhập khác Input
 *
 * - Các prop còn lại (type, autoComplete, placeholder…) được chuyển thẳng xuống <Input>.
 * - `below` hiện ngay dưới ô nhập (vd thước độ mạnh mật khẩu).
 * - Là item của stagger cha (variants riseSm) nên tự trượt vào cùng form.
 * - Lỗi hiện bằng fade + trượt 4px, không rung.
 */
export function Field({ control, name, label, optional = false, description, below, render, className, ...inputProps }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // value null/undefined → "" để input luôn là controlled (React cảnh báo khi đổi uncontrolled → controlled).
        const safe = { ...field, value: field.value ?? "" };
        const message = fieldState.error?.message;
        return (
          <motion.div variants={riseSm}>
            <FormItem className={cn("content-start", className)}>
              <FormLabel className="justify-between">
                <span>{label}</span>
                {optional ? <span className="text-caption font-normal text-disabled-foreground">Không bắt buộc</span> : null}
              </FormLabel>
              <FormControl>{render ? render(safe) : <Input {...safe} {...inputProps} />}</FormControl>
              {below}
              {description ? <FormDescription className="text-caption text-muted-foreground">{description}</FormDescription> : null}
              {message ? (
                <motion.div key={message} {...messageIn}>
                  <FormMessage className="text-meta" />
                </motion.div>
              ) : null}
            </FormItem>
          </motion.div>
        );
      }}
    />
  );
}
