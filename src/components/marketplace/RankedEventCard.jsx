import { memo } from "react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/site";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";
import { EventCaption } from "./EventCaption";

export const RankedEventCard = memo(function RankedEventCard({ event, rank, imageWidth = 480, className }) {
  if (!event) return null;
  const { slug, name, coverImageUrl, coverImageAlt } = event;
  return (
    <article className={cn("group", className)}>
      <Link to={`/events/${slug}`} className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <span className="sr-only">Hạng {rank}: </span>
        <div className="relative flex items-end">
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none relative z-0 -mr-6 w-16 shrink-0 text-center leading-[0.8] font-extrabold tracking-tighter text-transparent tabular-nums select-none [-webkit-text-stroke:2px_var(--green)] md:w-22",
              rank >= 10 ? "text-[4.25rem] md:text-[5.5rem]" : "text-[6rem] md:text-[8rem]"
            )}
          >
            {rank}
          </span>
          <div className="relative z-10 aspect-poster min-w-0 flex-1 overflow-hidden rounded-card bg-surface shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
            <ImageWithFallback
              src={imageAt(coverImageUrl, imageWidth)}
              alt={coverImageAlt || name}
              fallbackLabel={name}
              className="size-full group-hover:scale-105 motion-reduce:group-hover:scale-100"
            />
          </div>
        </div>
        <EventCaption event={event} className="pl-12 md:pl-16" />
      </Link>
    </article>
  );
});
