// Primitive shadcn: Textarea.

import * as React from "react"
import { cn } from "@/lib/utils"
import { fieldClass } from "./input"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldClass,
        "flex field-sizing-content min-h-24 w-full px-3 py-2.5 leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
