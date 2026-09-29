// Hằng số ngoài component: object params giữ nguyên tham chiếu giữa các lần render.

import { Flame } from "lucide-react";
import { useEvents } from "@/api";
import { Carousel, RankedEventCard } from "@/components/marketplace";
import { sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";

const PARAMS = { sort: "popular", size: 10 };

export function TrendingSection() {
  const query = useEvents(PARAMS);
  const events = query.data?.content ?? [];
  return (
    <HomeSection
      id="home-trending"
      title="Sự kiện xu hướng"
      icon={Flame}
      iconClassName="text-orange-400"
      href="/events?sort=popular"
      status={sectionStatus([query], events.length)}
      error={query.error}
      onRetry={query.refetch}
      skeleton={<RowSkeleton kind="ranked" />}
    >
      <Carousel label="Danh sách sự kiện xu hướng" perView="ranked" arrows="always" arrowClassName="top-[38%]">
        {events.map((e, i) => (
          <RankedEventCard key={e.id} event={e} rank={i + 1} />
        ))}
      </Carousel>
    </HomeSection>
  );
}
