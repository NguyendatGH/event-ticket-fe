import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }) {
  return (
    <span className={cn("inline-grid size-4 shrink-0 place-items-center", className)}>
      <svg viewBox="0 0 16 16" className="size-full" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="var(--green)" />
        <path d="M4.6 8.2l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Đã xác minh</span>
    </span>
  );
}
