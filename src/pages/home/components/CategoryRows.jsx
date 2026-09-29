// Các hàng theo nhóm danh mục; mỗi nhóm gộp tối đa 2 danh mục của BE.

import { useMemo } from "react";
import { useEvents } from "@/api";
import { Carousel, EventTile } from "@/components/marketplace";
import { byStartsAt, mergeEvents, sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";
import { TILE_ROW } from "../lib";

const GROUPS = [
  { key: "music", title: "Nhạc sống", slugs: ["music"] },
  { key: "arts", title: "Sân khấu & Nghệ thuật", slugs: ["theatre", "exhibition"] },
  { key: "sport", title: "Thể thao", slugs: ["sport"] },
  { key: "learn", title: "Hội thảo & Workshop", slugs: ["conference", "workshop"] },
];
const ROW_SIZE = 8;

function CategoryRow({ group }) {
  const [first, second] = group.slugs;
  const a = useEvents({ category: first, sort: "date", size: ROW_SIZE });
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

export function CategoryRows() {
  return GROUPS.map((g) => <CategoryRow key={g.key} group={g} />);
}
