import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

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

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
