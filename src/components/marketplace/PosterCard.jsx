import { memo } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/site";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";
import { EventCaption } from "./EventCaption";
import { CLOSED_STATUSES } from "./eventStatus";

/**
 * Poster dọc 3:4 bo 10px (design-spec v2, "Sự kiện đặc biệt"): ảnh bìa cắt dọc, hover nhấc 4px + ảnh phóng nhẹ.
 *
 *   <Carousel label="Sự kiện đặc biệt" perView="poster">{events.map((e) => <PosterCard key={e.id} event={e} />)}</Carousel>
 *
 * Props: event (EventResponse summary), caption (true: tên/ngày/giá dưới ảnh; false: chỉ poster, tên vẫn ở alt),
 * priority (ảnh màn hình đầu), imageWidth (px tải về, mặc định 520), className.
 * memo: danh sách dài trong carousel không render lại khi trang cha đổi state không liên quan.
 */
export const PosterCard = memo(function PosterCard({ event, caption = true, priority = false, imageWidth = 520, className }) {
  if (!event) return null;
  const { slug, name, coverImageUrl, coverImageAlt, status } = event;
  const closed = CLOSED_STATUSES.has(status);
  return (
    <article className={cn("group", className)}>
      <Link to={`/events/${slug}`} className="block rounded-poster focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <div className="relative aspect-poster overflow-hidden rounded-poster bg-surface ring-1 ring-white/5 transition-transform duration-300 ease-out-quint group-hover:-translate-y-1 motion-reduce:group-hover:translate-y-0">
          <ImageWithFallback
            src={imageAt(coverImageUrl, imageWidth)}
            alt={coverImageAlt || name}
            fallbackLabel={name}
            priority={priority}
            className={cn(
              "size-full group-hover:scale-105 motion-reduce:group-hover:scale-100",
              closed && "opacity-60"
            )}
          />
        </div>
        {caption ? <EventCaption event={event} /> : <span className="sr-only">{name}</span>}
      </Link>
    </article>
  );
});
