import * as React from "react"
import { cn } from "@/lib/utils"

// Nền chung cho ô nhập (Input, Textarea, SearchInput, NativeSelect, ô giá resale):
// nền #171B19, viền 1px, radius 4px, hover sáng viền, focus = viền xanh, lỗi = viền đỏ.
export const fieldClass =
  "rounded-md border border-input bg-input-bg text-sm text-foreground transition-colors outline-none placeholder:text-disabled-foreground hover:border-border-hover focus-visible:border-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50";

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldClass,
        "h-10 w-full min-w-0 px-3 py-1 selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
