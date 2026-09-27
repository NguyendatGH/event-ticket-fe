import { flattenPages, useAppConfig, useResaleListings } from "@/api";
import { Carousel } from "@/components/marketplace";
import { cheapestPerEvent, sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";
import { TILE_ROW } from "./layout";
import { ResaleTile } from "./ResaleTile";

// `select` của query đặt ngoài component để giữ tham chiếu (select mới mỗi render → TanStack chạy lại select).
const toGroups = (data) => cheapestPerEvent(flattenPages(data));
const PARAMS = { size: 8, sort: "newest" };

/**
 * "Vé bán lại" (useResaleListings → GET /resale?size=8&sort=newest): mỗi sự kiện một thẻ (tin rẻ nhất),
 * kèm số tin khác. Chưa có tin nào → ẩn cả hàng. Dòng chú thích dưới hàng nêu trần giá (useAppConfig).
 */
export function ResaleSection() {
  const query = useResaleListings(PARAMS, { select: toGroups });
  const groups = query.data ?? [];
  // Trần giá lấy từ cấu hình BE (GET /config), không viết cứng 120%.
  const { resaleMaxMarkupPercent } = useAppConfig();
  return (
    <HomeSection
      id="home-resale"
      title="Vé bán lại"
      href="/resale"
      linkLabel="Xem sàn vé"
      status={sectionStatus([query], groups.length)}
      error={query.error}
      onRetry={query.refetch}
      skeleton={<RowSkeleton kind="tile" />}
    >
      <Carousel label="Danh sách vé bán lại" perView={TILE_ROW} arrows="always" arrowClassName="top-[32%]">
        {groups.map((g) => (
          <ResaleTile key={g.listing.id} listing={g.listing} others={g.others} />
        ))}
      </Carousel>
      <p className="mt-4 text-xs text-muted-foreground">
        Vé do người mua trước bán lại, giá không vượt quá {100 + resaleMaxMarkupPercent}% giá gốc. Mã QR được cấp mới khi chuyển nhượng.
      </p>
    </HomeSection>
  );
}
