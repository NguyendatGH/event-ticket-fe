import { cn } from "@/lib/utils";

export function LanguageMark({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-white/90", className)} title="Tiếng Việt">
      <svg viewBox="0 0 20 20" className="size-5 rounded-full ring-1 ring-white/60" aria-hidden="true">
        <circle cx="10" cy="10" r="10" fill="#da251d" />
        <path fill="#ffcd00" d="M10 4.6l1.27 3.9h4.1l-3.32 2.41 1.27 3.9L10 12.4l-3.32 2.41 1.27-3.9L4.63 8.5h4.1z" />
      </svg>
      <span aria-hidden="true">VI</span>
      <span className="sr-only">Ngôn ngữ: Tiếng Việt</span>
    </span>
  );
}
