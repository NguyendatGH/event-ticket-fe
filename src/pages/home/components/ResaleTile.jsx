import { memo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Repeat2 } from "lucide-react";
import { ImageWithFallback, Price } from "@/components/site";
import { formatDate, formatVND } from "@/lib/format";
import { imageAt } from "@/lib/image";

/**
 * Thẻ tin bán lại (hàng "Vé bán lại" trang chủ): ảnh 16:9 bo 12px có nhãn "Bán lại", tên sự kiện,
 * hạng vé · ngày, giá bán + giá gốc, số tin khác của cùng sự kiện. Link tới /resale/:id.
 * Giá gốc ghi riêng "Giá gốc …" (không gạch ngang): giá bán lại có thể cao hơn giá gốc (trần 120%).
 * memo: danh sách trong carousel không render lại khi trang cha đổi state.
 *
 * Props: listing (ResaleListingResponse), others (số tin khác của cùng sự kiện), imageWidth (mặc định 720).
 */
export const ResaleTile = memo(function ResaleTile({ listing, others = 0, imageWidth = 720 }) {
  const { event, tier } = listing;
  return (
    <article className="group">
      <Link
        to={`/resale/${listing.id}`}
        className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <div className="relative aspect-wide overflow-hidden rounded-card bg-surface ring-1 ring-white/5">
          <ImageWithFallback
            src={imageAt(event?.coverImageUrl, imageWidth)}
            alt={event?.coverImageAlt || event?.name || ""}
            fallbackLabel={event?.name}
            className="size-full group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
          />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Repeat2 className="size-3.5 text-primary-bright" aria-hidden="true" />
            Bán lại
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-ui leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
            {event?.name}
          </h3>
          <p className="flex min-w-0 items-center gap-1.5 text-meta text-muted-foreground tabular-nums">
            <span className="truncate">{[tier?.name, formatDate(event?.startsAt)].filter(Boolean).join(" · ")}</span>
            {listing.verified ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 text-primary">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Đã xác thực
              </span>
            ) : null}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-2 pt-0.5">
            <Price value={listing.price} size="sm" />
            {listing.originalPrice != null ? (
              <span className="text-xs text-muted-foreground tabular-nums">Giá gốc {formatVND(listing.originalPrice)}</span>
            ) : null}
          </p>
          {others > 0 ? <p className="text-xs text-muted-foreground tabular-nums">+{others} vé khác cho sự kiện này</p> : null}
        </div>
      </Link>
    </article>
  );
});
