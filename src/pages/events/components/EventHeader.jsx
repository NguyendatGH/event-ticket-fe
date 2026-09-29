// Trạng thái đáng báo cho khách. PUBLISHED (đang bán) là bình thường nên không gắn nhãn.

import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { CalendarDays, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/site";
import { categoryLabel } from "@/lib/constants";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { heroLine, heroStagger } from "@/lib/motion";

const SHOW_BADGE = new Set(["UPCOMING", "SOLD_OUT", "ENDED", "CANCELLED"]);

export function EventHeader({ event }) {
  const { venue } = event;
  return (
    <motion.header
      variants={heroStagger}
      initial="hidden"
      animate="show"
      className="relative z-10 -mt-20 pb-10 md:-mt-32 lg:col-span-7 lg:-mt-40"
    >
      <motion.div
        variants={heroLine}
        className="flex flex-wrap items-center gap-3"
      >
        {event.category ? (
          <Link
            to={`/events?category=${event.category}`}
            className="eyebrow transition-colors hover:text-foreground"
          >
            {categoryLabel(event.category)}
          </Link>
        ) : null}
        {SHOW_BADGE.has(event.status) ? (
          <StatusBadge kind="event" status={event.status} />
        ) : null}
      </motion.div>
      <motion.h1
        variants={heroLine}
        className="mt-4 text-display text-balance text-foreground"
      >
        {event.name}
      </motion.h1>
      {event.tagline ? (
        <motion.p
          variants={heroLine}
          className="mt-5 max-w-[56ch] text-body-lg text-secondary-foreground"
        >
          {event.tagline}
        </motion.p>
      ) : null}
      <motion.dl
        variants={heroLine}
        className="mt-9 grid gap-6 sm:grid-cols-2"
      >
        <div className="flex gap-3.5">
          <CalendarDays
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <dt className="sr-only">Thời gian</dt>
            <dd className="font-medium text-foreground">
              {formatDateLong(event.startsAt)}
            </dd>
            <dd className="mt-1 text-sm text-muted-foreground tabular-nums">
              {formatTimeRange(event.startsAt, event.endsAt)}
            </dd>
          </div>
        </div>
        {venue ? (
          <div className="flex gap-3.5">
            <MapPin
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="sr-only">Địa điểm</dt>
              <dd className="font-medium text-foreground">
                {venue.name}
              </dd>
              <dd className="mt-1 text-sm text-muted-foreground">
                {venue.city}
              </dd>
            </div>
          </div>
        ) : null}
      </motion.dl>
    </motion.header>
  );
}
