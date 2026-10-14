import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,opacity,transform] ease-out-quint focus-ring active:scale-[0.98] active:duration-100 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-45 arrow-nudge aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-elevated disabled:text-muted-foreground disabled:opacity-100",
        secondary: "border border-border bg-transparent text-foreground hover:border-border-hover hover:bg-surface",
        ghost: "text-secondary-foreground hover:bg-surface hover:text-foreground",
        destructive: "border border-destructive/60 bg-transparent text-destructive hover:bg-destructive/10",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-3 text-meta has-[>svg]:px-2.5",
        lg: "h-12 px-7 text-ui has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
