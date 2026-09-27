import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Ticket } from "lucide-react";
import { DEFAULT_PAGE_SIZE } from "@/api";
import { EmptyState, ErrorState, InfiniteSentinel } from "@/components/site";
import { Button } from "@/components/ui/button";
import { gridItem, inView } from "@/lib/motion";
import { listingGridClass } from "../lib";
import { ListingCard, ListingGridSkeleton } from "./ListingCard";

/**
 * Lưới kết quả của chợ vé (/resale): đang tải → skeleton, lỗi → ErrorState,
 * rỗng → 2 kiểu EmptyState (đang lọc / chợ trống), có vé → lưới thẻ + cuộn vô hạn.
 *   query          kết quả useResaleListings (infinite query)
 *   hasAnyFilter   đang có từ khóa / bộ lọc nào không
 *   eventSlug      slug của sự kiện đang lọc (?eventId=), để mời mua vé gốc
 */
export function ListingResults({ query, listings, hasAnyFilter, onClearAll, eventSlug }) {
  if (query.isPending) return <ListingGridSkeleton count={6} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  if (listings.length === 0 && hasAnyFilter) {
    return (
      <EmptyState
        icon={Ticket}
        title="Không có vé phù hợp"
        description="Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác. Vé mới được đăng bán mỗi ngày."
        action={
          <>
            <Button variant="secondary" onClick={onClearAll}>
              Xóa bộ lọc
            </Button>
            {eventSlug ? (
              <Button asChild variant="ghost">
                <Link to={`/events/${eventSlug}`}>Mua vé từ ban tổ chức</Link>
              </Button>
            ) : null}
          </>
        }
      />
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title="Chưa có vé nào được bán lại"
        description="Khi có người nhượng vé, tin bán sẽ xuất hiện ở đây. Trong lúc chờ, bạn có thể mua vé trực tiếp từ ban tổ chức."
        action={
          <Button asChild>
            <Link to="/events">Khám phá sự kiện</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <ul className={listingGridClass(3)}>
        {listings.map((listing, i) => (
          // Trang tải thêm: trễ theo vị trí trong trang (i % PAGE_SIZE), không dồn trễ theo tổng số thẻ.
          <motion.li key={listing.id} variants={gridItem(i % DEFAULT_PAGE_SIZE)} {...inView}>
            <ListingCard listing={listing} priority={i < 3} />
          </motion.li>
        ))}
      </ul>
      <InfiniteSentinel query={query} endLabel="Đã hiển thị tất cả vé đang bán" />
    </>
  );
}
