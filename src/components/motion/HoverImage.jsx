// Đặt trong phần tử có class `group`. Không nhấc thẻ, không shadow (design-spec).

import { ImageWithFallback } from "@/components/site/ImageWithFallback";
import { cn } from "@/lib/utils";

export function HoverImage({ src, alt, priority, ratio = "4/3", dim = false, size = "md", fallbackLabel, className, imgClassName }) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      <ImageWithFallback
        src={src}
        alt={alt}
        priority={priority}
        fallbackLabel={fallbackLabel ?? alt}
        className={cn(
          "size-full duration-[800ms] will-change-transform group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:group-hover:scale-100",
          dim && "opacity-60",
          imgClassName
        )}
      />
      {size === "sm" ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-background/15 transition-opacity duration-500 ease-out-quint group-hover:opacity-0 group-focus-visible:opacity-0"
        />
      )}
    </div>
  );
}
