// Khung nội dung 1320px, lề theo breakpoint.

import { cn } from "@/lib/utils";

export function Container({ as: Tag = "div", className, ...props }) {
  return <Tag className={cn("mx-auto w-full max-w-site px-5 sm:px-6 lg:px-8", className)} {...props} />;
}
