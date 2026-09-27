/**
 * Trang chi tiết một tin bán lại — route /resale/:id
 * Thông tin sự kiện + người bán, khung mua (BuyPanel), lịch sử giao dịch, vé tương tự.
 * Dữ liệu: useResaleListing(id); lịch sử và vé tương tự tự tải trong component riêng của chúng.
 */
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useResaleListing } from "@/api";
import { BackLink, Container, EmptyState, ErrorState, ImageWithFallback, KeyValueList, UserAvatar } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { categoryLabel } from "@/lib/constants";
import { formatDateLong, formatRelative, formatTimeRange, formatVND } from "@/lib/format";
import { fadeUp, imageSettle, riseSm, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { BuyPanel } from "./components/BuyPanel";
import { ListingHistorySection } from "./components/ListingHistorySection";
import { RelatedListings } from "./components/RelatedListings";
import { priceDiffPct } from "./lib";

/** Khung mua hiện sau phần nội dung một nhịp (0.2s). */
const buyPanelIn = { hidden: riseSm.hidden, show: { ...riseSm.show, transition: { ...riseSm.show.transition, delay: 0.2 } } };

function BackToMarket() {
  return <BackLink to="/resale">Vé bán lại</BackLink>;
}

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Đang tải vé bán lại">
      <Skeleton className="mt-6 aspect-card w-full rounded-none md:aspect-[21/8]" />
      <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
          <div className="space-y-0 border-t border-border pt-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="my-4 h-4 w-2/3" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-105 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

export default function ResaleDetailPage() {
  const { id } = useParams();
  const query = useResaleListing(id);
  const listing = query.data;
  useDocumentTitle(listing ? `${listing.event?.name} · ${listing.tier?.name}` : "Vé bán lại");

  if (query.isPending) {
    return (
      <Container className="pt-8 pb-24">
        <BackToMarket />
        <DetailSkeleton />
      </Container>
    );
  }

  if (query.isError) {
    return (
      <Container className="pt-8 pb-24">
        <BackToMarket />
        {query.error?.status === 404 ? (
          <EmptyState
            title="Không tìm thấy tin bán"
            description="Tin bán lại này không tồn tại hoặc đường dẫn đã sai."
            action={
              <Button asChild>
                <Link to="/resale">Xem vé đang bán</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={query.error} onRetry={query.refetch} />
        )}
      </Container>
    );
  }

  const { event = {}, tier, seller } = listing;
  // Chỉ giá thấp hơn / bằng giá gốc mới tô xanh; bán cao hơn giá gốc thì giá trắng.
  const markup = priceDiffPct(listing.price, listing.originalPrice) > 0;
  const venue = event.venue || {};
  // Địa chỉ thường đã kèm thành phố ("…, Quận 1, TP.HCM") → không lặp lại thành phố.
  const address = venue.address?.includes(venue.city) ? venue.address : [venue.address, venue.city].filter(Boolean).join(", ");

  return (
    <Container className="pt-8 pb-32 lg:pb-24">
      <BackToMarket />

      <motion.div variants={stagger} initial="hidden" animate="show">
        <div className="mt-6 aspect-card overflow-hidden bg-surface md:aspect-[21/8]">
          {/* Ảnh bìa lắng xuống khi mở trang (1.04 → 1), không Ken Burns. */}
          <motion.div variants={imageSettle} className="size-full">
            <ImageWithFallback src={event.coverImageUrl} alt={event.name || ""} fallbackLabel={event.name} priority className="size-full" />
          </motion.div>
        </div>

        <div className="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-14">
          <div className="min-w-0 lg:col-span-7">
            <motion.header variants={fadeUp}>
              <p className="eyebrow">
                Vé bán lại{event.category ? <span className="text-muted-foreground"> · {categoryLabel(event.category)}</span> : null}
              </p>
              <h1 className="mt-3 text-h1 text-balance text-foreground">{event.name}</h1>
              {event.tagline ? <p className="mt-4 max-w-[60ch] text-body-lg text-secondary-foreground">{event.tagline}</p> : null}
            </motion.header>

            <motion.div variants={fadeUp} className="mt-10">
              <KeyValueList
                labelWidth="sm:grid-cols-[160px_1fr]"
                items={[
                  { label: "Ngày", value: <span className="tabular-nums">{formatDateLong(event.startsAt)}</span> },
                  { label: "Thời gian", value: <span className="tabular-nums">{formatTimeRange(event.startsAt, event.endsAt)}</span> },
                  {
                    label: "Địa điểm",
                    value: (
                      <>
                        {venue.name}
                        {address ? <span className="mt-0.5 block text-muted-foreground">{address}</span> : null}
                      </>
                    ),
                  },
                  {
                    label: "Người bán",
                    value: seller ? (
                      <span className="inline-flex items-center gap-2.5">
                        <UserAvatar user={seller} size="sm" />
                        {seller.displayName}
                      </span>
                    ) : null,
                  },
                  { label: "Đăng bán", value: listing.createdAt ? <span className="tabular-nums">{formatRelative(listing.createdAt)}</span> : null },
                ]}
              />
              {event.slug ? (
                <Link to={`/events/${event.slug}`} className="arrow-nudge mt-5 inline-flex items-center gap-1.5 text-sm link-accent">
                  Xem trang sự kiện
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </motion.div>

            <ListingHistorySection id={id} />
          </div>

          <motion.aside id="buy-panel" variants={buyPanelIn} aria-label="Mua vé" className="scroll-mt-24 lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <BuyPanel listing={listing} onUnavailable={query.refetch} />
            </div>
          </motion.aside>
        </div>
      </motion.div>

      <RelatedListings id={id} />

      {/* Điện thoại: thanh dưới đáy giữ giá + nút "Mua vé" cuộn tới khung mua (#buy-panel). */}
      {listing.status === "ACTIVE" && !listing.mine ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div className="min-w-0">
            <p className="truncate text-caption text-muted-foreground">{tier?.name}</p>
            <p className={cn("text-lg font-semibold tabular-nums", markup ? "text-foreground" : "text-primary")}>{formatVND(listing.price)}</p>
          </div>
          <Button onClick={() => document.getElementById("buy-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Mua vé</Button>
        </div>
      ) : null}
    </Container>
  );
}
