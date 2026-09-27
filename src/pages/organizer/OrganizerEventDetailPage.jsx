/**
 * Trang chi tiết một sự kiện của ban tổ chức — route /organizer/events/:id
 * Đầu trang (trạng thái, lịch, nút Sửa / Xuất bản), số liệu bán vé, bảng hạng vé, danh sách đơn hàng.
 * Dữ liệu: useOrganizerEvent(id) (GET /organizer/events/{id}, kèm stats); đơn hàng tự tải trong EventOrders.
 * Xuất bản bản nháp: PublishEventDialog.
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Pencil, Rocket } from "lucide-react";
import { useOrganizerEvent } from "@/api";
import { ImageWithFallback, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { categoryLabel } from "@/lib/constants";
import { formatDateLong, formatNumber, formatTimeRange, formatVND } from "@/lib/format";
import { fadeUp, stagger } from "@/lib/motion";
import { EventOrders } from "./components/EventOrders";
import { BlockTitle, EventLoadError, OrgHeader, StatStrip, StatStripSkeleton } from "./components/OrgUi";
import { PublishEventDialog } from "./components/PublishEventDialog";
import { TierTable } from "./components/TierTable";
import { percentOf } from "./lib/helpers";

export default function OrganizerEventDetailPage() {
  const { id } = useParams();
  const query = useOrganizerEvent(id);
  const event = query.data;
  useDocumentTitle(event?.name || "Chi tiết sự kiện");
  const [publishOpen, setPublishOpen] = useState(false);

  if (query.isPending) return <DetailSkeleton />;
  if (query.isError) return <EventLoadError error={query.error} onRetry={query.refetch} />;

  const isDraft = event.status === "DRAFT";
  const stats = event.stats || {};
  const venue = [event.venue?.name, event.venue?.city].filter(Boolean).join(", ");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <OrgHeader
          back={{ to: "/organizer/events", label: "Sự kiện" }}
          eyebrow={categoryLabel(event.category) || "Sự kiện"}
          title={event.name}
          meta={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <StatusBadge kind="event" status={event.status} />
              <span className="tabular-nums">
                {event.startsAt
                  ? `${formatDateLong(event.startsAt)}, ${formatTimeRange(event.startsAt, event.endsAt)}`
                  : "Chưa có lịch"}
              </span>
              {venue ? <span>{venue}</span> : null}
            </div>
          }
          actions={
            <>
              {!isDraft && event.slug ? (
                <Button asChild variant="ghost" className="max-md:-ml-4">
                  <Link to={`/events/${event.slug}`}>
                    Trang công khai
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link to={`/organizer/events/${event.id}/edit`}>
                  <Pencil aria-hidden="true" />
                  Sửa
                </Link>
              </Button>
              {isDraft ? (
                <Button onClick={() => setPublishOpen(true)}>
                  <Rocket aria-hidden="true" />
                  Xuất bản
                </Button>
              ) : null}
            </>
          }
        >
          {event.coverImageUrl ? (
            <ImageWithFallback
              src={event.coverImageUrl}
              alt={event.coverImageAlt || event.name}
              fallback={null}
              fallbackLabel={event.name}
              priority
              className="mt-8 aspect-21/9 w-full md:aspect-32/9"
            />
          ) : (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border border-dashed border-border-hover px-5 py-6 text-sm">
              <span className="text-muted-foreground">
                Sự kiện chưa có ảnh bìa. Cần ảnh bìa để xuất bản.
              </span>
              <Link
                to={`/organizer/events/${event.id}/edit?step=1`}
                className="font-medium link-accent"
              >
                Thêm ảnh bìa
              </Link>
            </div>
          )}
        </OrgHeader>
      </motion.div>

      <motion.div variants={fadeUp}>
        <StatStrip
          items={[
            {
              label: "Doanh thu",
              value: { n: stats.revenue ?? 0, format: formatVND },
              sub: "Từ đơn đã thanh toán",
            },
            {
              label: "Vé đã bán",
              value: { n: stats.ticketsSold ?? 0, format: formatNumber },
              sub: `trên ${formatNumber(stats.ticketsTotal ?? 0)} vé, ${Math.round(percentOf(stats.ticketsSold ?? 0, stats.ticketsTotal ?? 0))}%`,
            },
            {
              label: "Đơn đã thanh toán",
              value: { n: stats.ordersPaid ?? 0, format: formatNumber },
            },
            {
              label: "Đơn chờ thanh toán",
              value: { n: stats.ordersPending ?? 0, format: formatNumber },
              sub: stats.ordersPending ? "Vé đang được giữ chỗ" : null,
            },
          ]}
        />
      </motion.div>

      <motion.section variants={fadeUp} className="mt-12" aria-labelledby="tiers-title">
        <BlockTitle id="tiers-title" title="Hạng vé">
          <Link
            to={`/organizer/events/${event.id}/edit?step=3`}
            className="text-sm link-quiet"
          >
            Sửa hạng vé
          </Link>
        </BlockTitle>
        <TierTable eventId={event.id} tiers={event.tiers || []} />
      </motion.section>

      <motion.section variants={fadeUp} className="mt-14" aria-labelledby="orders-title">
        <EventOrders eventId={event.id} isDraft={isDraft} />
      </motion.section>

      <PublishEventDialog event={event} open={publishOpen} onOpenChange={setPublishOpen} />
    </motion.div>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Đang tải sự kiện">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-6 h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-1/2" />
      <Skeleton className="mt-3 h-4 w-72" />
      <Skeleton className="mt-8 aspect-32/9 w-full rounded-none" />
      <div className="mt-8 border-t border-border">
        <StatStripSkeleton />
      </div>
      <div className="mt-12 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
