import { useMemo } from "react";
import { useFeaturedEvents, useUpcomingEvents } from "@/api";
import { Carousel, PosterCard } from "@/components/marketplace";
import { mergeEvents, sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";

const MAX = 12;

export function SpecialEventsSection() {
  const featured = useFeaturedEvents();
  const upcoming = useUpcomingEvents(MAX);
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
