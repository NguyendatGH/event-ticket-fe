import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({ error, onRetry, title, className, compact = false }) {
  const heading = title || (error?.status === 404 ? "Không tìm thấy" : "Không tải được dữ liệu");
  return (
    <div role="alert" className={cn(compact ? "py-6" : "flex flex-col items-center px-4 py-16 text-center md:py-20", className)}>
      <p className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>{heading}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{error?.message || "Có lỗi xảy ra. Thử lại sau."}</p>
      {error?.traceId ? <p className="mt-3 font-mono text-2xs text-disabled-foreground">Mã tra cứu: {error.traceId}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-6" onClick={() => onRetry()}>
          <RotateCw aria-hidden="true" />
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}
