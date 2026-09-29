// Shimmer quét ngang (transform) thay cho pulse; mọi skeleton chung nhịp 1.6s nên cả lưới quét đồng bộ.

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-sm bg-surface",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-white/[0.045] after:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
