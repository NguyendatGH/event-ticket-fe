import { memo } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/site";
import { categoryLabel } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";

export const HeroBanner = memo(function HeroBanner({ event, priority = false, ctaLabel = "Xem chi tiết", showMeta = true, imageWidth = 1200, className }) {
  if (!event) return null;
  const { slug, name, coverImageUrl, coverImageAlt, startsAt, venue, category } = event;
  return (
    <Link
      to={`/events/${slug}`}
      className={cn(
        "group relative block aspect-banner overflow-hidden rounded-card bg-surface ring-1 ring-white/5",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
        className
      )}
    >
      <ImageWithFallback
        src={imageAt(coverImageUrl, imageWidth)}
        alt={coverImageAlt || name}
        fallbackLabel={name}
        priority={priority}
        className="size-full group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 shell-scrim" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-4 md:p-6">
        {showMeta ? (
          <div className="max-w-[90%] space-y-1 text-white">
            {category ? <p className="text-xs font-semibold tracking-caps text-primary-bright uppercase">{categoryLabel(category)}</p> : null}
            <h3 className="line-clamp-2 text-lg leading-tight font-bold md:text-2xl">{name}</h3>
            <p className="text-meta text-white/85 tabular-nums">{[formatDate(startsAt), venue?.city].filter(Boolean).join(" · ")}</p>
          </div>
        ) : null}
        <span className="inline-flex h-9 items-center rounded-md bg-white px-4 text-sm font-medium text-zinc-900 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
});
