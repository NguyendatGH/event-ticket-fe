/**
 * Trang chi tiết sự kiện, route "/events/:slug".
 * Dữ liệu (4 request chạy song song, không chờ nhau):
 *   useEvent(slug)              GET /events/{slug}               nội dung chính + hạng vé
 *   useMoreFromOrganizer(slug)  GET /events/{slug}/more-from-organizer
 *   useRelatedEvents(slug)      GET /events/{slug}/related
 *   useResaleListings           GET /resale?eventId=&size=1      chỉ lấy tổng số tin bán lại
 * 404 → hiện trang "không tìm thấy" nhưng giữ nguyên URL. Chọn vé xong → /checkout/:slug?tiers=… (TicketSelector).
 */
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import {
  totalOf,
  useEvent,
  useMoreFromOrganizer,
  useRelatedEvents,
  useResaleListings,
} from "@/api";
import { Container, ErrorState } from "@/components/site";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { inView as reveal, riseSm, stagger } from "@/lib/motion";
import { NotFoundView } from "../NotFoundPage";
import { DetailBlock } from "./components/DetailBlock";
import { EventCover } from "./components/EventCover";
import { EventDetailSkeleton } from "./components/EventDetailSkeleton";
import { EventHeader } from "./components/EventHeader";
import { EventOrganizer } from "./components/EventOrganizer";
import { EventRail } from "./components/EventRail";
import { MobileBuyBar } from "./components/MobileBuyBar";
import { TicketSelector } from "./components/TicketSelector";
import { toParagraphs } from "./lib";

export default function EventDetailPage() {
  const { slug } = useParams();
  const eventQ = useEvent(slug);
  const event = eventQ.data;
  // Hai rail chạy song song với request chi tiết (chỉ cần slug), không chờ event về
  const more = useMoreFromOrganizer(slug, 4);
  const related = useRelatedEvents(slug, 4);
  // Chỉ cần tổng số tin bán lại. select: totalOf → component chỉ render lại khi con số này đổi.
  // enabled: phải có event.id (từ request chi tiết) mới gọi được.
  const resale = useResaleListings(
    { eventId: event?.id, size: 1 },
    { enabled: Boolean(event?.id), select: totalOf },
  );
  useDocumentTitle(event?.name ?? (eventQ.isError ? "Sự kiện" : "Đang tải"));

  if (eventQ.isError) {
    if (eventQ.error?.status === 404) {
      return (
        <NotFoundView
          title="Không tìm thấy sự kiện"
          description="Sự kiện không tồn tại, chưa được công bố hoặc đường dẫn đã thay đổi."
        />
      );
    }
    return (
      <Container>
        <ErrorState error={eventQ.error} onRetry={eventQ.refetch} />
      </Container>
    );
  }
  if (eventQ.isPending) return <EventDetailSkeleton />;

  const { venue, organizer } = event;
  const description = toParagraphs(event.description);
  const schedule = event.schedule ?? [];
  // Link Google Maps tìm theo tên + địa chỉ + thành phố (không cần API key)
  const mapQuery = [venue?.name, venue?.address, venue?.city]
    .filter(Boolean)
    .join(", ");

  return (
    <article>
      <EventCover event={event} />

      <Container>
        <div className="grid gap-x-16 lg:grid-cols-12">
          <EventHeader event={event} />

          <aside
            className="relative z-10 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:-mt-24 xl:col-span-4 xl:col-start-9"
            aria-label="Mua vé"
          >
            <motion.div
              variants={riseSm}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-[94px]"
            >
              {/* key: chuyển sang sự kiện khác (cùng component) thì số vé đã chọn tự reset */}
              <TicketSelector
                key={event.id}
                event={event}
                resaleCount={resale.data ?? 0}
              />
            </motion.div>
          </aside>

          <div className="pt-10 lg:col-span-7 lg:pt-0">
            {description.length ? (
              <DetailBlock title="Giới thiệu" id="gioi-thieu">
                <div className="max-w-[68ch] space-y-5 text-body-lg text-secondary-foreground">
                  {description.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </DetailBlock>
            ) : null}

            {schedule.length ? (
              <DetailBlock title="Lịch trình" id="lich-trinh">
                <motion.ol
                  {...reveal}
                  variants={stagger}
                  className="border-t border-border md:border-t-0"
                >
                  {schedule.map((s, i) => (
                    <motion.li
                      key={`${s.time}-${i}`}
                      variants={riseSm}
                      className="group grid grid-cols-[72px_1fr] gap-4 border-b border-border py-3.5 first:pt-0 md:first:pt-0"
                    >
                      <span className="text-sm font-medium text-foreground tabular-nums transition-colors group-hover:text-primary">
                        {s.time}
                      </span>
                      <span className="text-sm text-secondary-foreground">
                        {s.title}
                      </span>
                    </motion.li>
                  ))}
                </motion.ol>
              </DetailBlock>
            ) : null}

            {venue ? (
              <DetailBlock title="Địa điểm" id="dia-diem">
                <p className="text-h3 text-foreground">{venue.name}</p>
                {venue.address ? (
                  <p className="mt-2 text-secondary-foreground">
                    {venue.address}
                  </p>
                ) : null}
                {venue.city ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {venue.city}
                  </p>
                ) : null}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="arrow-nudge mt-5 inline-flex items-center gap-1.5 text-sm link-accent"
                >
                  Xem bản đồ
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">(mở tab mới)</span>
                </a>
              </DetailBlock>
            ) : null}

            {organizer ? (
              <DetailBlock title="Ban tổ chức" id="ban-to-chuc">
                <EventOrganizer organizer={organizer} />
              </DetailBlock>
            ) : null}
          </div>
        </div>

        {organizer ? (
          <EventRail
            title={`Sự kiện khác của ${organizer.name}`}
            href={`/organizers/${organizer.slug}`}
            query={more}
            exclude={event.id}
          />
        ) : null}
        <EventRail
          title="Có thể bạn thích"
          href={
            event.category ? `/events?category=${event.category}` : "/events"
          }
          query={related}
          exclude={event.id}
        />
      </Container>
      <MobileBuyBar event={event} />
    </article>
  );
}
