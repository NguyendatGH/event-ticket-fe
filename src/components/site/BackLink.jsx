import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackLink({ className, children, ...props }) {
  return (
    <Link className={cn("arrow-nudge inline-flex items-center gap-1.5 text-sm link-quiet", className)} {...props}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
