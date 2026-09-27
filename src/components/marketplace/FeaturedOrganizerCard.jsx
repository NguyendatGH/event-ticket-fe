import { memo } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/site";
import { initials } from "@/lib/format";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";

/**
 * Thẻ "Ban tổ chức nổi bật" (design-spec v2): khung bo 12px viền xanh phát sáng (glow-card), avatar tròn lớn có
 * vòng sáng (logo hoặc chữ viết tắt trên nền gradient xanh), tên 1 dòng (cắt "…") + dấu tích nếu verified.
 * Link tới /organizers/:slug.
 *
 *   <Carousel label="Ban tổ chức nổi bật" perView="featured" gap="sm">
 *     {organizers.map((o) => <FeaturedOrganizerCard key={o.id} organizer={o} />)}
 *   </Carousel>
 *
 * Props: organizer (OrganizerResponse: slug, name, imageUrl/logoUrl, verified, eventsCount?), showCount (hiện "N sự kiện"), className.
 * Ảnh: imageUrl do BE chọn sẵn (logo → ảnh bìa BTC → ảnh sự kiện sắp diễn ra); chỉ khi không có ảnh nào mới hiện chữ viết tắt.
 */
export const FeaturedOrganizerCard = memo(function FeaturedOrganizerCard({ organizer, showCount = false, className }) {
  if (!organizer) return null;
  const { slug, name, verified, eventsCount } = organizer;
  const image = organizer.imageUrl ?? organizer.logoUrl;
  return (
    <Link
      to={`/organizers/${slug}`}
      title={name}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-card px-3 pt-4 pb-3.5 glow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className
      )}
    >
      <span className="relative block aspect-square w-full max-w-28 overflow-hidden rounded-full glow-ring">
        {image ? (
          <ImageWithFallback
            src={imageAt(image, 240)}
            alt=""
            fallback={null}
            fallbackLabel={name}
            className="size-full rounded-full group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-full place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--green-bright),var(--green-deep)_70%)] text-2xl font-bold text-white"
          >
            {initials(name)}
          </span>
        )}
      </span>
      <span className="flex w-full min-w-0 items-center justify-center gap-1.5">
        <span className="truncate text-sm font-bold text-foreground">{name}</span>
        {verified ? <VerifiedBadge /> : null}
      </span>
      {showCount && eventsCount != null ? <span className="-mt-2 text-xs text-muted-foreground">{eventsCount} sự kiện</span> : null}
    </Link>
  );
});
