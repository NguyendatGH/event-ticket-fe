// Số vé hiện sẵn mỗi sự kiện; phần còn lại nằm sau "Xem thêm N vé".

import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { Perforation } from "@/components/account";
import { ImageWithFallback, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, formatVND } from "@/lib/format";
import { imageAt } from "@/lib/image";
import { DUR, EASE_IN, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PREVIEW = 3;
const DAY_MS = 86_400_000;

export function TicketGroup({ event, tickets, past = false, now }) {
  const [open, setOpen] = useState(false);
  const hidden = tickets.length - PREVIEW;
  const shown = open || hidden <= 1 ? tickets : tickets.slice(0, PREVIEW);
  const days = event?.startsAt ? Math.ceil((new Date(event.startsAt).getTime() - now) / DAY_MS) : null;
  const soon = !past && days != null && days >= 0 && days <= 7;
  const eventHref = `/events/${event?.slug}`;

  return (
    <section aria-label={event?.name} className="relative overflow-hidden rounded-card bg-card ring-1 ring-white/5 transition-shadow duration-300 hover:ring-white/10">
      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        <Link to={eventHref} className="group block w-19 shrink-0 sm:w-24 md:w-28" tabIndex={-1} aria-hidden="true">
          <div className="aspect-poster overflow-hidden rounded-poster bg-surface ring-1 ring-white/5">
            <ImageWithFallback
              src={imageAt(event?.coverImageUrl, 240)}
              alt=""
              fallbackLabel={event?.name}
              className={cn("size-full group-hover:scale-105 motion-reduce:group-hover:scale-100", past && "opacity-60 grayscale-35")}
            />
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <p className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold tabular-nums", past ? "text-muted-foreground" : "text-primary")}>
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDate(event?.startsAt)} · {formatTime(event?.startsAt)}
              {soon ? (
                <span className="rounded-full bg-warning/12 px-2 py-0.5 text-xs font-semibold text-warning">{days === 0 ? "Hôm nay" : `Còn ${days} ngày`}</span>
              ) : null}
            </p>
            <span className="shrink-0 rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-secondary-foreground tabular-nums">{tickets.length} vé</span>
          </div>
          <h3 className="mt-1.5 text-lg leading-snug font-bold text-balance text-foreground md:text-xl">
            <Link to={eventHref} className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {event?.name}
            </Link>
          </h3>
          {event?.venue ? (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{[event.venue.name, event.venue.city].filter(Boolean).join(", ")}</span>
            </p>
          ) : null}
        </div>
      </div>

      <Perforation />

      <ul className="px-4 pt-1 pb-2 sm:px-5">
        <AnimatePresence initial={false}>
          {shown.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: { duration: DUR.moderate, ease: EASE_OUT, delay: Math.max(0, i - PREVIEW) * 0.035 } }}
              exit={{ opacity: 0, height: 0, transition: { duration: DUR.base, ease: EASE_IN } }}
              className="overflow-hidden border-b border-white/6 last:border-b-0"
            >
              <TicketLine ticket={t} past={past} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {hidden > 1 ? (
        <div className="border-t border-white/6 px-4 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm py-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {open ? "Thu gọn" : `Xem thêm ${hidden} vé`}
            <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

const TicketLine = memo(function TicketLine({ ticket, past }) {
  const { tier } = ticket;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3.5 sm:grid-cols-[1fr_auto_auto] sm:gap-x-6">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="text-ui font-semibold text-foreground">{tier?.name}</span>
        <code className="text-xs text-muted-foreground" title={ticket.ticketCode}>
          #…{String(ticket.ticketCode || "").slice(-6)}
        </code>
        {ticket.status !== "ACTIVE" ? <StatusBadge kind="ticket" status={ticket.status} /> : null}
      </div>
      <div className="text-right tabular-nums">
        <p className="text-ui font-bold text-foreground">{ticket.price > 0 ? formatVND(ticket.price) : "Miễn phí"}</p>
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:justify-end">
        <Button asChild size="sm" variant={past ? "secondary" : "default"}>
          <Link to={`/me/tickets/${ticket.id}`}>
            Xem vé <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
});

export function TicketGroupsSkeleton({ rows = 2 }) {
  return (
    <div role="status" aria-label="Đang tải vé" className="space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-card bg-card p-4 ring-1 ring-white/5 sm:p-5">
          <div className="flex gap-4 sm:gap-5">
            <Skeleton className="aspect-poster w-19 shrink-0 rounded-poster sm:w-24 md:w-28" />
            <div className="flex-1 space-y-3 pt-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
          <div className="mt-5 space-y-4 border-t border-white/6 pt-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
