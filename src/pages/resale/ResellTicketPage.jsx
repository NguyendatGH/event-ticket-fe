/**
 * Trang đăng bán lại / quản lý tin bán của một vé — route /me/tickets/:id/resell (cần đăng nhập).
 * Dữ liệu: useMyTicket(id). Tùy trạng thái vé mà hiện 1 trong 3 khối:
 *   vé đã có tin bán       → ManageListing (đổi giá / gỡ tin)
 *   vé không bán lại được → giải thích lý do (notResellableReason trong ./lib.js)
 *   còn lại                → CreateListing (form đăng bán)
 */
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { CircleAlert } from "lucide-react";
import { useAppConfig, useMyTicket } from "@/api";
import { BackLink, Container, EmptyState, ErrorState, ImageWithFallback, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDateLong, formatTime, formatVND, shortCode } from "@/lib/format";
import { fadeUp, stagger } from "@/lib/motion";
import { CreateListing } from "./components/CreateListing";
import { InfoItem } from "./components/InfoItem";
import { ManageListing } from "./components/ManageListing";
import { notResellableReason } from "./lib";

/** Tóm tắt vé: ảnh nhỏ + sự kiện + hạng vé + mã vé. Không khung, divider dưới. */
function TicketSummary({ ticket }) {
  const { event = {}, tier } = ticket;
  const venue = event.venue || {};
  return (
    <div className="flex gap-5 border-b border-border pb-8">
      <div className="w-28 shrink-0 sm:w-40">
        <div className="aspect-card overflow-hidden bg-surface">
          <ImageWithFallback src={event.coverImageUrl} alt={event.name || ""} className="size-full" />
        </div>
      </div>
      <div className="min-w-0 space-y-1.5">
        <p className="eyebrow tabular-nums">
          {formatDateLong(event.startsAt)} · {formatTime(event.startsAt)}
        </p>
        <Link to={`/events/${event.slug}`} className="block text-lg leading-snug font-semibold text-foreground transition-colors hover:text-primary">
          {event.name}
        </Link>
        <p className="text-sm text-muted-foreground">{[venue.name, venue.city].filter(Boolean).join(", ")}</p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-secondary-foreground">
          <span>{tier?.name}</span>
          <span className="tabular-nums">{formatVND(ticket.price)}</span>
          <span className="font-mono text-caption text-muted-foreground">Mã {shortCode(ticket.ticketCode, 4, 4)}</span>
        </p>
      </div>
    </div>
  );
}

/** Chọn khối chính theo trạng thái vé (xem sơ đồ ở đầu file). */
function ResellSection({ ticket }) {
  const { resaleCutoffHours } = useAppConfig(); // gọi hook trước mọi return sớm (luật của React hooks)
  if (ticket.listing) return <ManageListing ticket={ticket} />;

  const reason = notResellableReason(ticket, { cutoffHours: resaleCutoffHours });
  if (!reason) return <CreateListing ticket={ticket} />;

  return (
    <div className="max-w-2xl">
      <InfoItem icon={CircleAlert} tone="text-muted-foreground" title={reason.title} className="border-l-2 border-border-hover pl-4">
        {reason.description}
      </InfoItem>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link to={`/me/tickets/${ticket.id}`}>Xem vé</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/me/tickets">Vé của tôi</Link>
        </Button>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div role="status" aria-label="Đang tải vé" className="space-y-10 pt-10">
      <div className="flex gap-5 border-b border-border pb-8">
        <Skeleton className="aspect-card w-28 rounded-none sm:w-40" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    </div>
  );
}

export default function ResellTicketPage() {
  const { id } = useParams();
  const query = useMyTicket(id);
  const ticket = query.data;
  const listed = Boolean(ticket?.listing);
  useDocumentTitle(listed ? "Quản lý tin bán lại" : "Đăng bán lại vé");

  const back = <BackLink to={`/me/tickets/${id}`}>Chi tiết vé</BackLink>;

  let body;
  if (query.isPending) {
    body = <PageSkeleton />;
  } else if (query.isError && query.error?.status === 404) {
    body = (
      <EmptyState
        title="Không tìm thấy vé"
        description="Vé không tồn tại hoặc không thuộc tài khoản của bạn."
        action={
          <Button asChild>
            <Link to="/me/tickets">Về vé của tôi</Link>
          </Button>
        }
      />
    );
  } else if (query.isError) {
    body = <ErrorState error={query.error} onRetry={query.refetch} />;
  } else {
    body = (
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-10 pt-10">
        <motion.div variants={fadeUp}>
          <TicketSummary ticket={ticket} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ResellSection ticket={ticket} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <Container className="pb-24">
      <div className="pt-8">{back}</div>
      <PageHeader
        className="pt-6 md:pt-8"
        title={listed ? "Quản lý tin bán lại" : "Đăng bán lại vé"}
        description={
          listed
            ? "Đổi giá hoặc gỡ tin khi chưa có người mua."
            : "Không thể tham dự? Nhượng lại vé cho người khác với giá không vượt giá trần."
        }
      />
      {body}
    </Container>
  );
}
