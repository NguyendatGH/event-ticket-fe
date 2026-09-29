// Khi không có ApiError cụ thể (vd nhiều query cùng lỗi) vẫn có câu hướng dẫn.

import { Reveal } from "@/components/motion";
import { SectionTitle } from "@/components/marketplace";
import { Container, ErrorState } from "@/components/site";
import { cn } from "@/lib/utils";

const FALLBACK_ERROR = { message: "Kiểm tra kết nối mạng rồi thử lại. Các mục khác trên trang vẫn dùng bình thường." };

export function HomeSection({
  id,
  title,
  icon,
  iconClassName,
  href,
  linkLabel,
  status = "ready",
  onRetry,
  error,
  errorTitle,
  skeleton,
  className,
  before,
  children,
}) {
  if (status === "empty") return null;
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} aria-busy={status === "loading" || undefined} className={cn("py-5 md:py-7", className)}>
      {before}
      <Container className="relative">
        <SectionTitle
          id={titleId}
          icon={icon}
          iconClassName={iconClassName}
          title={title}
          href={status === "ready" ? href : undefined}
          linkLabel={linkLabel}
        />
        {status === "loading" ? skeleton : null}
        {status === "error" ? (
          <ErrorState
            compact
            onRetry={onRetry}
            title={errorTitle ?? `Không tải được mục "${title}"`}
            error={error ?? FALLBACK_ERROR}
            className="rounded-card bg-card px-5"
          />
        ) : null}
        {status === "ready" ? (
          <Reveal size="sm">{children}</Reveal>
        ) : null}
      </Container>
    </section>
  );
}
