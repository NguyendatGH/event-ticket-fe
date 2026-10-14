import { Link } from "react-router-dom";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }) {
  return (
    <Link
      to={to}
      aria-label={`${BRAND.name}, về trang chủ`}
      className={cn("inline-block text-[19px] leading-none font-bold tracking-[0.2em] text-foreground transition-opacity hover:opacity-80", className)}
    >
      {BRAND.wordmark}
    </Link>
  );
}
