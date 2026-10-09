import { cn } from "@/lib/utils";

export function Perforation({ orientation = "horizontal", className }) {
  const vertical = orientation === "vertical";
  return (
    <div aria-hidden="true" className={cn("relative", vertical ? "w-0 self-stretch" : "h-0", className)}>
      <span className={cn("absolute border-dashed border-white/14", vertical ? "inset-y-4 left-0 border-l-2" : "inset-x-4 top-0 border-t-2")} />
      <span className={cn("absolute size-6 rounded-full bg-page", vertical ? "-top-3 -left-3" : "-top-3 -left-3")} />
      <span className={cn("absolute size-6 rounded-full bg-page", vertical ? "-bottom-3 -left-3" : "-top-3 -right-3")} />
    </div>
  );
}
