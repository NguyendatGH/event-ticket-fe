// Thẻ sự kiện kiểu editorial (v1), bọc memo cho lưới dài.

import { memo } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HoverImage } from "@/components/motion/HoverImage";
import { Price } from "./Price";
import { StatusBadge } from "./StatusBadge";

const CLOSED = new Set(["SOLD_OUT", "ENDED", "CANCELLED"]);

export const EventCard = memo(function EventCard({ event, priority = false, showCategory = false, className }) {
  if (!event) return null;
  const { slug, name, startsAt, venue, coverImageUrl, coverImageAlt, priceFrom, status, category } = event;
  const closed = CLOSED.has(status);
  return (
    <article className={cn("group relative", className)}>
      <Link to={`/events/${slug}`} className="group block focus-ring focus-visible:outline-offset-4">
        <HoverImage src={coverImageUrl} alt={coverImageAlt || name} fallbackLabel={name} priority={priority} dim={closed} />
        <div className="mt-4 space-y-1.5">
          <p className="eyebrow tabular-nums">
            {formatDate(startsAt)}
            {showCategory && category ? <span className="ml-3 text-muted-foreground">{categoryLabel(category)}</span> : null}
          </p>
          <h3 className="line-clamp-2 text-title leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_1px] motion-reduce:transition-none">
              {name}
            </span>
          </h3>
          {venue ? (
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {[venue.name, venue.city].filter(Boolean).join(", ")}
            </p>
          ) : null}
          <div className="flex items-center gap-3 pt-1">
            {closed ? <StatusBadge kind="event" status={status} /> : <Price value={priceFrom} from size="sm" />}
          </div>
        </div>
      </Link>
    </article>
  );
});
