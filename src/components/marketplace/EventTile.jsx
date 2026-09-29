// Thẻ sự kiện ngang 16:9 cho các hàng/lưới v2.

import { memo } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/site";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";
import { EventCaption } from "./EventCaption";
import { CLOSED_STATUSES } from "./eventStatus";

export const EventTile = memo(function EventTile({ event, priority = false, imageWidth = 720, className }) {
  if (!event) return null;
  const { slug, name, coverImageUrl, coverImageAlt, status } = event;
  return (
    <article className={cn("group", className)}>
      <Link to={`/events/${slug}`} className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <div className="aspect-wide overflow-hidden rounded-card bg-surface ring-1 ring-white/5">
          <ImageWithFallback
            src={imageAt(coverImageUrl, imageWidth)}
            alt={coverImageAlt || name}
            fallbackLabel={name}
            priority={priority}
            className={cn("size-full group-hover:scale-[1.04] motion-reduce:group-hover:scale-100", CLOSED_STATUSES.has(status) && "opacity-60")}
          />
        </div>
        <EventCaption event={event} />
      </Link>
    </article>
  );
});
