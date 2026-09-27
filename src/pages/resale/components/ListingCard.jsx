import { memo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { HoverImage } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatDiff, listingGridClass, priceDiffPct } from "../lib";

/** Dấu "Đã xác thực" nhỏ, xanh tiết chế. */
export function VerifiedMark({ className, label = "Đã xác thực" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-caption text-primary", className)}>
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

/**
 * Thẻ vé bán lại, cùng ngôn ngữ với EventCard (ảnh 4:3, không khung):
 *   ảnh · ngày, thành phố · tên sự kiện · hạng vé · Giá bán / Giá gốc · xác thực, người bán
 * listing = ResaleListingResponse. memo: object listing giữ nguyên tham chiếu qua các lần refetch (structural sharing),
 * nên đổi bộ lọc / chip / tải thêm không render lại các thẻ cũ. Chỉ truyền prop ổn định.
 */
export const ListingCard = memo(function ListingCard({ listing, priority = false, className }) {
  if (!listing) return null;
  const { id, price, originalPrice, tier, event = {}, seller, verified } = listing;
  const diff = priceDiffPct(price, originalPrice);
  // Chỉ giảm giá mới được tô xanh ("deal"); bán cao hơn giá gốc: giá trắng, chênh lệch màu cảnh báo.
  const markup = diff > 0;
  return (
    <article className={cn("group relative", className)}>
      <Link to={`/resale/${id}`} className="block focus-ring focus-visible:outline-offset-4">
        <HoverImage src={event.coverImageUrl} alt={event.name || ""} fallbackLabel={event.name} priority={priority} />
        <div className="mt-4 space-y-1.5">
          <p className="eyebrow tabular-nums">
            {formatDate(event.startsAt)}
            {event.venue?.city ? <span className="ml-3 text-muted-foreground">{event.venue.city}</span> : null}
          </p>
          <h3 className="line-clamp-2 text-title leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_1px] motion-reduce:transition-none">
              {event.name}
            </span>
          </h3>
          <p className="line-clamp-1 text-sm text-secondary-foreground">{tier?.name}</p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
          <div>
            <dt className="text-caption text-muted-foreground">Giá bán</dt>
            <dd className={cn("mt-0.5 text-base font-semibold tabular-nums", markup ? "text-foreground" : "text-primary")}>{formatVND(price)}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">Giá gốc</dt>
            <dd className="mt-0.5 text-base text-muted-foreground tabular-nums">
              <span className={cn(diff < 0 && "line-through decoration-1")}>{formatVND(originalPrice)}</span>
              {diff ? <span className={cn("ml-2 text-caption", markup ? "text-warning" : "text-primary")}>{formatDiff(diff)}</span> : null}
            </dd>
          </div>
        </dl>
        <p className="mt-3 flex min-w-0 items-center gap-3 text-caption text-muted-foreground">
          {verified ? <VerifiedMark /> : null}
          {seller?.displayName ? <span className="truncate">Người bán {seller.displayName}</span> : null}
        </p>
      </Link>
    </article>
  );
});

/** Khung xám cùng hình dạng với ListingCard. */
function ListingCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-card w-full rounded-none" />
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-2.5 h-5 w-4/5" />
      <Skeleton className="mt-2 h-3.5 w-1/3" />
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="mt-3 h-3 w-40" />
    </div>
  );
}

export function ListingGridSkeleton({ count = 6, columns = 3 }) {
  return (
    <div className={listingGridClass(columns)} role="status" aria-label="Đang tải vé bán lại">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
