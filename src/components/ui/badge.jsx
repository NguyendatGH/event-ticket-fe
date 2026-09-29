// Nhãn trạng thái nhỏ (ĐANG BÁN, BẢN NHÁP…): radius 2px, chữ hoa 11px, màu nền pha nhẹ, không pill to.

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-1.5 py-0.5 text-2xs leading-4 font-medium tracking-caps uppercase whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary",
        secondary: "bg-elevated text-secondary-foreground",
        outline: "border-border text-secondary-foreground",
        destructive: "bg-destructive/12 text-destructive",
        warning: "bg-warning/12 text-warning",
        info: "bg-info/12 text-info",
        muted: "bg-surface text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
