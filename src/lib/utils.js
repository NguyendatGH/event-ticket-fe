import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Báo cho tailwind-merge biết các token tự định nghĩa trong index.css (@theme), nếu không
// "text-caption" bị coi là màu chữ và bị "text-muted-foreground" ghi đè mất.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "body-lg", "caption", "price", "2xs", "meta", "ui", "title"],
      tracking: ["caps", "label"],
      aspect: ["card"],
      container: ["site"],
    },
  },
});

/** Gộp className, class Tailwind sau thắng class trước. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
