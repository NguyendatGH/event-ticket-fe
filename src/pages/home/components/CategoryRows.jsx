import { useMemo } from "react";
import { useEvents } from "@/api";
import { Carousel, EventTile } from "@/components/marketplace";
import { byStartsAt, mergeEvents, sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";
import { TILE_ROW } from "./layout";

/**
 * Các hàng theo nhóm danh mục (thẻ ngang 16:9). Mỗi nhóm gộp tối đa 2 danh mục của BE (GET /events chỉ lọc
 * được một category mỗi lần), để 6 danh mục thành 4 hàng dày hơn. "Xem thêm ›" mở danh mục đầu của nhóm.
 * Muốn thêm/đổi hàng: sửa mảng này (slugs lấy từ CATEGORIES trong @/lib/constants).
 */
const GROUPS = [
  { key: "music", title: "Nhạc sống", slugs: ["music"] },
  { key: "arts", title: "Sân khấu & Nghệ thuật", slugs: ["theatre", "exhibition"] },
  { key: "sport", title: "Thể thao", slugs: ["sport"] },
  { key: "learn", title: "Hội thảo & Workshop", slugs: ["conference", "workshop"] },
];
// Số thẻ tối đa mỗi hàng
const ROW_SIZE = 8;

/**
 * Một hàng: useEvents cho danh mục thứ nhất và (nếu có) thứ hai, gộp + sắp theo ngày diễn ra.
 * Hai lời gọi hook cố định (không gọi hook trong vòng lặp); slug thứ hai không có thì query thứ hai tắt.
 */
function CategoryRow({ group }) {
  const [first, second] = group.slugs;
  const a = useEvents({ category: first, sort: "date", size: ROW_SIZE });
  // Không có slug thứ hai: dùng lại key của query đầu (tắt fetch). Nếu để category trống, key trùng "mọi sự kiện"
  // và có thể đọc nhầm cache của danh sách không lọc.
  const b = useEvents({ category: second ?? first, sort: "date", size: ROW_SIZE }, { enabled: Boolean(second) });
  const events = useMemo(
    () => byStartsAt(mergeEvents(a.data?.content, b.data?.content)).slice(0, ROW_SIZE),
    [a.data, b.data]
  );
  const queries = second ? [a, b] : [a];
  return (
    <HomeSection
      id={`home-cat-${group.key}`}
      title={group.title}
      href={`/events?category=${first}`}
      status={sectionStatus(queries, events.length)}
      error={a.error ?? b.error}
      onRetry={() => queries.forEach((q) => q.isError && q.refetch())}
      skeleton={<RowSkeleton kind="tile" />}
    >
      <Carousel label={`Danh sách ${group.title}`} perView={TILE_ROW} arrows="always" arrowClassName="top-[32%]">
        {events.map((e) => (
          <EventTile key={e.id} event={e} />
        ))}
      </Carousel>
    </HomeSection>
  );
}

/** Toàn bộ hàng danh mục, mỗi hàng tự tải và tự ẩn khi rỗng. */
export function CategoryRows() {
  return GROUPS.map((g) => <CategoryRow key={g.key} group={g} />);
}
