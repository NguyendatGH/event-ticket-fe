import { useMemo } from "react";
import { useFeaturedEvents, useUpcomingEvents } from "@/api";
import { Carousel, PosterCard } from "@/components/marketplace";
import { mergeEvents, sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";

// Số poster tối đa trong hàng
const MAX = 12;

/**
 * "Sự kiện đặc biệt": poster dọc 3:4 (ảnh bìa cắt dọc) của sự kiện nổi bật + sắp diễn ra, gộp và bỏ trùng.
 * useFeaturedEvents dùng chung cache với hero (không thêm request); useUpcomingEvents(12) → GET /events/upcoming?limit=12.
 * Một nguồn lỗi mà nguồn kia có dữ liệu thì vẫn hiện phần có.
 */
export function SpecialEventsSection() {
  const featured = useFeaturedEvents();
  const upcoming = useUpcomingEvents(MAX);
  // useMemo: chỉ gộp lại khi một trong hai danh sách đổi, không phải mỗi lần render.
  const events = useMemo(() => mergeEvents(featured.data, upcoming.data).slice(0, MAX), [featured.data, upcoming.data]);
  const queries = [featured, upcoming];
  return (
    <HomeSection
      id="home-special"
      title="Sự kiện đặc biệt"
      href="/events"
      status={sectionStatus(queries, events.length)}
      error={featured.error ?? upcoming.error}
      onRetry={() => queries.forEach((q) => q.isError && q.refetch())}
      skeleton={<RowSkeleton kind="poster" />}
    >
      <Carousel label="Danh sách sự kiện đặc biệt" perView="poster" arrows="always" arrowClassName="top-[36%]">
        {events.map((e, i) => (
          <PosterCard key={e.id} event={e} priority={i < 2} />
        ))}
      </Carousel>
    </HomeSection>
  );
}
