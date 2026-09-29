// Vé điện tử trong TicketDetailPage, hình cuống vé (thẻ bo 12px, khuyết tròn ở đường xé):

import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Perforation } from "@/components/account";
import { ImageWithFallback, StatusBadge, TicketQR } from "@/components/site";
import { formatDateLong, formatDateTime, formatTimeRange, formatVND } from "@/lib/format";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";
import { QRReveal } from "@/components/site";

export function TicketCard({ ticket }) {
  const { event, tier } = ticket;
  const venue = event?.venue;
  const refunded = ticket.status === "REFUNDED";
  const ended = event?.status === "ENDED";

  let qrHint = "Đưa mã này cho nhân viên soát vé. Không chia sẻ ảnh chụp mã cho người khác.";
  if (ended) qrHint = "Sự kiện đã diễn ra. Vé được giữ lại để bạn tra cứu.";

  const facts = [
    {
      label: "Thời gian",
      value: (
        <span className="tabular-nums">
          {formatDateLong(event?.startsAt)}, {formatTimeRange(event?.startsAt, event?.endsAt)}
        </span>
      ),
      wide: true,
    },
    {
      label: "Địa điểm",
      value: venue ? (
        <>
          {venue.name}
          {venue.address || venue.city ? <span className="block text-muted-foreground">{[venue.address, venue.city].filter(Boolean).join(", ")}</span> : null}
        </>
      ) : null,
      wide: true,
    },
    { label: "Hạng vé", value: tier?.name },
    { label: "Giá vé", value: <span className="tabular-nums">{ticket.price > 0 ? formatVND(ticket.price) : "Miễn phí"}</span> },
    { label: "Phát hành", value: <span className="tabular-nums">{formatDateTime(ticket.issuedAt)}</span> },
    {
      label: "Đơn hàng",
      value: ticket.orderId ? (
        <Link to={`/orders/${ticket.orderId}`} className="arrow-nudge inline-flex items-center gap-1 link-accent">
          <code>#{ticket.orderCode}</code> <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null,
    },
  ].filter((f) => f.value != null && f.value !== "");

  return (
    <article
      aria-labelledby="ticket-title"
      className="@container/ticket relative grid overflow-hidden rounded-card bg-card ring-1 ring-white/5 @3xl/ticket:grid-cols-[minmax(0,1fr)_auto_300px] @4xl/ticket:grid-cols-[minmax(0,1fr)_auto_320px]"
    >
      <header className="flex gap-4 p-5 @3xl/ticket:relative @3xl/ticket:col-start-1 @3xl/ticket:row-start-1 @3xl/ticket:block @3xl/ticket:p-0">
        <Link
          to={`/events/${event?.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="group relative block w-20 shrink-0 overflow-hidden rounded-poster @xl/ticket:w-24 @3xl/ticket:w-full @3xl/ticket:rounded-none"
        >
          <div className="aspect-poster @3xl/ticket:aspect-2/1">
            <ImageWithFallback
              src={imageAt(event?.coverImageUrl, 960)}
              alt=""
              fallbackLabel={event?.name}
              priority
              className={cn("size-full group-hover:scale-105 motion-reduce:group-hover:scale-100", ended && "opacity-60 grayscale-35")}
            />
          </div>
          <span aria-hidden="true" className="absolute inset-0 hidden shell-scrim @3xl/ticket:block" />
        </Link>
        <div className="min-w-0 @3xl/ticket:absolute @3xl/ticket:inset-x-0 @3xl/ticket:bottom-0 @3xl/ticket:px-7 @3xl/ticket:pb-6">
          <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums", ended ? "text-muted-foreground" : "text-primary")}>
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDateLong(event?.startsAt)}
          </p>
          <h1 id="ticket-title" className="mt-1.5 text-xl leading-tight font-bold text-balance text-foreground @2xl/ticket:text-2xl @3xl/ticket:text-[30px]">
            {event?.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-semibold text-foreground">{tier?.name}</span>
            <StatusBadge kind="ticket" status={ticket.status} />
          </div>
          {venue ? (
            <p className="mt-2.5 hidden items-start gap-1.5 text-sm text-muted-foreground @xl/ticket:flex @3xl/ticket:hidden">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {[venue.name, venue.city].filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
      </header>

      <Perforation className="@3xl/ticket:hidden" />
      <Perforation
        orientation="vertical"
        className="hidden @3xl/ticket:col-start-2 @3xl/ticket:row-span-2 @3xl/ticket:row-start-1 @3xl/ticket:block"
      />

      <aside
        aria-label="Mã vào cổng"
        className="px-5 py-7 text-center @3xl/ticket:col-start-3 @3xl/ticket:row-span-2 @3xl/ticket:row-start-1 @3xl/ticket:flex @3xl/ticket:flex-col @3xl/ticket:items-center @3xl/ticket:justify-center @3xl/ticket:px-7"
      >
        <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Mã vào cổng</p>
        {refunded ? (
          <p className="mt-6 text-sm text-muted-foreground">Vé đã được hoàn tiền, mã QR không còn hiệu lực.</p>
        ) : (
          <>
            <QRReveal live={!ended && ticket.status === "ACTIVE"} delay={0.45} className={cn("mt-5 rounded-md", ended && "opacity-50")}>
              <TicketQR value={ticket.ticketCode} size={208} showCode={false} />
            </QRReveal>
            <code className="mx-auto mt-4 block max-w-[30ch] text-xs tracking-wide break-all text-muted-foreground">{ticket.ticketCode}</code>
            <p className="mx-auto mt-4 max-w-[34ch] text-meta leading-relaxed text-secondary-foreground">{qrHint}</p>
          </>
        )}
      </aside>

      <section
        aria-labelledby="ticket-info"
        className="@container/facts border-t border-white/6 p-5 @3xl/ticket:col-start-1 @3xl/ticket:row-start-2 @3xl/ticket:border-t-0 @3xl/ticket:px-7 @3xl/ticket:pt-6 @3xl/ticket:pb-7"
      >
        <h2 id="ticket-info" className="sr-only">
          Thông tin vé
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 @2xl/facts:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className={cn("min-w-0", f.wide && "col-span-2")}>
              <dt className="text-xs font-semibold text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium wrap-anywhere text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
