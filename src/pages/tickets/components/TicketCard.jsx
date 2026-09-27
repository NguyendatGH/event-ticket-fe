import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Perforation } from "@/components/account";
import { ImageWithFallback, StatusBadge, TicketQR } from "@/components/site";
import { formatDateLong, formatDateTime, formatTimeRange, formatVND } from "@/lib/format";
import { imageAt } from "@/lib/image";
import { cn } from "@/lib/utils";
import { QRReveal } from "./QRReveal";

/**
 * Vé điện tử trong TicketDetailPage, hình cuống vé (thẻ bo 12px, khuyết tròn ở đường xé):
 *   ≥ lg:  [ảnh bìa 2:1 · ngày · tên · hạng | thông tin vé]  ┊  [MÃ VÀO CỔNG: QR + mã + ghi chú]
 *   < lg:  [poster nhỏ + ngày · tên · hạng] ‑ ‑ ‑ [QR] ─── [thông tin vé]   (QR lên trước: thứ cần ở cổng)
 * Một phần tử ảnh duy nhất đổi tỉ lệ theo breakpoint (không tải hai ảnh).
 * aside "Mã vào cổng" giữ nguyên nhãn (E2E và trình đọc màn hình tìm theo nhãn này).
 */
export function TicketCard({ ticket }) {
  const { event, tier, listing } = ticket;
  const venue = event?.venue;
  const refunded = ticket.status === "REFUNDED";
  const ended = event?.status === "ENDED";

  let qrHint = "Đưa mã này cho nhân viên soát vé. Không chia sẻ ảnh chụp mã cho người khác.";
  if (ended) qrHint = "Sự kiện đã diễn ra. Vé được giữ lại để bạn tra cứu.";
  else if (listing) qrHint = "Vé đang được rao bán. Nếu bán thành công, mã này sẽ bị vô hiệu và người mua nhận mã mới.";

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
    { label: "Giá gốc", value: <span className="tabular-nums">{ticket.price > 0 ? formatVND(ticket.price) : "Miễn phí"}</span> },
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
      className="relative grid overflow-hidden rounded-card bg-card ring-1 ring-white/5 lg:grid-cols-[minmax(0,1fr)_auto_300px] xl:grid-cols-[minmax(0,1fr)_auto_320px]"
    >
      {/* Đầu vé: ảnh + tên. Mobile: poster nhỏ bên trái; lg: ảnh bìa 2:1 phủ cả chiều ngang cột. */}
      <header className="flex gap-4 p-5 lg:relative lg:col-start-1 lg:row-start-1 lg:block lg:p-0">
        <Link
          to={`/events/${event?.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="group relative block w-20 shrink-0 overflow-hidden rounded-poster sm:w-24 lg:w-full lg:rounded-none"
        >
          <div className="aspect-poster lg:aspect-2/1">
            <ImageWithFallback
              src={imageAt(event?.coverImageUrl, 960)}
              alt=""
              fallbackLabel={event?.name}
              priority
              className={cn("size-full group-hover:scale-105 motion-reduce:group-hover:scale-100", ended && "opacity-60 grayscale-35")}
            />
          </div>
          <span aria-hidden="true" className="absolute inset-0 hidden shell-scrim lg:block" />
        </Link>
        <div className="min-w-0 lg:absolute lg:inset-x-0 lg:bottom-0 lg:px-7 lg:pb-6">
          <p className={cn("inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums", ended ? "text-muted-foreground" : "text-primary")}>
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDateLong(event?.startsAt)}
          </p>
          <h1 id="ticket-title" className="mt-1.5 text-xl leading-tight font-bold text-balance text-foreground md:text-2xl lg:text-[30px]">
            {event?.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-semibold text-foreground">{tier?.name}</span>
            <StatusBadge kind="ticket" status={ticket.status} />
            {listing ? <StatusBadge kind="listing" status={listing.status} /> : null}
          </div>
          {venue ? (
            <p className="mt-2.5 hidden items-start gap-1.5 text-sm text-muted-foreground sm:flex lg:hidden">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {[venue.name, venue.city].filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
      </header>

      {/* Đường xé: ngang trên mobile (giữa đầu vé và QR), dọc giữa hai cột trên lg. */}
      <Perforation className="lg:hidden" />
      <Perforation orientation="vertical" className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block" />

      <aside aria-label="Mã vào cổng" className="px-5 py-7 text-center lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-7">
        <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Mã vào cổng</p>
        {refunded ? (
          <p className="mt-6 text-sm text-muted-foreground">Vé đã được hoàn tiền, mã QR không còn hiệu lực.</p>
        ) : (
          <>
            {/* Vạch quét chạy một lần khi vé còn dùng được ở cổng (không quét khi đã qua/đang rao bán). */}
            <QRReveal live={!ended && !listing && ticket.status === "ACTIVE"} delay={0.45} className={cn("mt-5 rounded-md", ended && "opacity-50")}>
              <TicketQR value={ticket.ticketCode} size={208} showCode={false} />
            </QRReveal>
            <code className="mx-auto mt-4 block max-w-[30ch] text-xs tracking-wide break-all text-muted-foreground">{ticket.ticketCode}</code>
            <p className="mx-auto mt-4 max-w-[34ch] text-meta leading-relaxed text-secondary-foreground">{qrHint}</p>
          </>
        )}
      </aside>

      <section aria-labelledby="ticket-info" className="border-t border-white/6 p-5 lg:col-start-1 lg:row-start-2 lg:border-t-0 lg:px-7 lg:pt-6 lg:pb-7">
        <h2 id="ticket-info" className="sr-only">
          Thông tin vé
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className={cn("min-w-0", f.wide && "col-span-2")}>
              <dt className="text-xs font-semibold text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
