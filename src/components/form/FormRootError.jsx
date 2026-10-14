import { useFormState } from "react-hook-form";
import { motion } from "motion/react";
import { messageIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
