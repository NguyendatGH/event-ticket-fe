/**
 * Các khối "tóm tắt đơn hàng" dùng chung cho trang checkout (success/failed) và trang /orders/:id:
 *   SPLIT_GRID / SPLIT_ASIDE  lưới 2 cột (nội dung | cột phụ)
 *   EventAside                ảnh + thông tin sự kiện ở cột phụ
 *   PaymentDetails            bảng thông tin thanh toán (đặt trong <Disclosure>)
 *   IssuedTickets             danh sách vé đã cấp kèm QR
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HoverImage } from "@/components/motion";
import { TicketQR, StatusBadge } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateLong, formatDateTime, formatTimeRange } from "@/lib/format";
import { rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { QRReveal } from "@/pages/tickets/components/QRReveal";
import { venueLine } from "../lib";

/** Lưới 2 cột (nội dung 7 | cột phụ 4 lệch phải) của trang thành công, thất bại, đơn hàng. */
export const SPLIT_GRID = "grid gap-14 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-16";
export const SPLIT_ASIDE = "lg:col-span-4 lg:col-start-9";

/**
 * Ảnh + thông tin sự kiện ở cột phụ. `event` là EventResponse, hoặc chỉ { name, slug } khi chưa tải xong.
 */
export function EventAside({ event, loading, className }) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)} aria-hidden="true">
        <Skeleton className="aspect-card w-full rounded-none" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  if (!event) return null;
  return (
    <aside aria-label="Sự kiện" className={cn("space-y-4", className)}>
      <Link to={`/events/${event.slug}`} className="group block overflow-hidden" tabIndex={-1} aria-hidden="true">
        <HoverImage src={event.coverImageUrl} alt="" fallbackLabel={event.name} ratio="4/3" />
      </Link>
      <div className="space-y-1.5">
        <Link to={`/events/${event.slug}`} className="text-h3 text-foreground transition-colors hover:text-primary">
          {event.name}
        </Link>
        {event.startsAt ? (
          <p className="text-sm text-secondary-foreground tabular-nums">
            {formatDateLong(event.startsAt)}, {formatTimeRange(event.startsAt, event.endsAt)}
          </p>
        ) : null}
        {event.venue ? <p className="text-sm text-muted-foreground">{venueLine(event.venue)}</p> : null}
      </div>
    </aside>
  );
}

/** Dòng thông tin thanh toán trong Disclosure. */
export function PaymentDetails({ order }) {
  const p = order?.payment;
  const rows = [
    ["Mã đơn", order?.orderCode],
    ["Cổng thanh toán", p?.provider],
    ["Trạng thái thanh toán", p?.status ? <StatusBadge kind="payment" status={p.status} /> : null],
    ["Mã giao dịch", p?.transactionRef],
    ["Thanh toán lúc", p?.paidAt ? formatDateTime(p.paidAt) : null],
    ["Tạo đơn lúc", order?.createdAt ? formatDateTime(order.createdAt) : null],
  ].filter(([, v]) => v != null && v !== "");
  return (
    <dl className="grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-[180px_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-meta break-all text-foreground tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Danh sách vé đã cấp của một đơn, mỗi vé kèm QR (khách vãng lai không có "Vé của tôi" nên QR phải hiện ở đây).
 * linkToTicket: người dùng đã đăng nhập → thêm "Xem vé" tới /me/tickets/:id.
 * delayRows: lùi nhịp xuất hiện (trang thành công chờ dấu tick vẽ xong). QR quét một lần cho vé còn hiệu lực.
 */
export function IssuedTickets({ tickets = [], eventName, linkToTicket = false, qrSize = 112, delayRows = 0, className }) {
  if (!tickets.length) return null;
  return (
    <ul className={cn("border-t border-border", className)}>
      {tickets.map((t, i) => (
        <motion.li
          key={t.id}
          initial={rowItem.initial}
          animate={{ ...rowItem.animate, transition: { ...rowItem.animate.transition, delay: (Math.min(i, 9) + delayRows) * 0.06 } }}
          className="flex flex-col gap-5 border-b border-border py-6 sm:flex-row sm:items-center sm:gap-8"
        >
          <QRReveal live={t.status === "ACTIVE"} delay={0.3 + (Math.min(i, 9) + delayRows) * 0.06} className="self-start">
            <TicketQR value={t.ticketCode} size={qrSize} showCode={false} />
          </QRReveal>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="eyebrow">
              Vé {i + 1}/{tickets.length}
            </p>
            <p className="text-title font-semibold text-foreground">{t.tierName}</p>
            {eventName ? <p className="text-sm text-secondary-foreground">{eventName}</p> : null}
            <code className="block text-[12px] break-all text-muted-foreground">{t.ticketCode}</code>
          </div>
          <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:items-end sm:gap-3">
            <StatusBadge kind="ticket" status={t.status} />
            {linkToTicket ? (
              <Link to={`/me/tickets/${t.id}`} className="arrow-nudge inline-flex items-center gap-1 text-sm font-medium link-accent">
                Xem vé <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
