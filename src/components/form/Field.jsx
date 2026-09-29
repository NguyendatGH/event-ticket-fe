// Một ô của form react-hook-form: nhãn, ô nhập, gợi ý, lỗi.

import { motion } from "motion/react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messageIn, riseSm } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Field({ control, name, label, optional = false, description, below, render, className, ...inputProps }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
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
