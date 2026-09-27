import { Reveal } from "@/components/motion";
import { SectionTitle } from "@/components/marketplace";
import { Container, ErrorState } from "@/components/site";
import { cn } from "@/lib/utils";

// Khi không có ApiError cụ thể (vd nhiều query cùng lỗi) vẫn có câu hướng dẫn.
const FALLBACK_ERROR = { message: "Kiểm tra kết nối mạng rồi thử lại. Các mục khác trên trang vẫn dùng bình thường." };

/**
 * Khung chung của mọi section trang chủ: <section aria-labelledby> + SectionTitle + nội dung theo trạng thái.
 *
 *   <HomeSection id="home-trending" title="Sự kiện xu hướng" icon={Flame} href="/events?sort=popular"
 *     status={sectionStatus([query], events.length)} onRetry={query.refetch} skeleton={<RowSkeleton kind="ranked" />}>
 *     <Carousel …>…</Carousel>
 *   </HomeSection>
 *
 * status (từ sectionStatus trong ../lib):
 *   "loading" → tiêu đề + `skeleton` (khung chờ cùng hình dạng, không nhảy layout khi dữ liệu về)
 *   "error"   → tiêu đề + ErrorState gọn có nút "Thử lại" (chỉ section này báo lỗi, phần còn lại của trang vẫn hiện)
 *   "empty"   → không render gì (section rỗng thì ẩn)
 *   "ready"   → tiêu đề + children (hiện dần khi cuộn tới, Reveal chạy một lần)
 * Props khác: icon, iconClassName, href, linkLabel (truyền thẳng cho SectionTitle), error (ApiError để hiện thông điệp BE), errorTitle,
 * className (thẻ section, vd nền GlowWaves cần "relative isolate overflow-hidden"), before (phần tử nền đặt trước Container).
 */
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
