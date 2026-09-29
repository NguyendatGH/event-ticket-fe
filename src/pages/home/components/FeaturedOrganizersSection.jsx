// Section "Ban tổ chức nổi bật" trên nền sóng sáng.

import { Star } from "lucide-react";
import { useFeaturedOrganizers } from "@/api";
import { Carousel, FeaturedOrganizerCard, GlowWaves } from "@/components/marketplace";
import { sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";

export function FeaturedOrganizersSection() {
  const query = useFeaturedOrganizers(12);
  const organizers = query.data ?? [];
  return (
    <HomeSection
      id="home-organizers"
      title="Ban tổ chức nổi bật"
      icon={Star}
      iconClassName="fill-warning text-warning"
      href="/events"
      status={sectionStatus([query], organizers.length)}
      error={query.error}
      onRetry={query.refetch}
      skeleton={<RowSkeleton kind="featured" />}
      className="relative isolate overflow-hidden py-10 md:py-14"
      before={<GlowWaves />}
    >
      <Carousel label="Danh sách ban tổ chức nổi bật" perView="featured" gap="sm">
        {organizers.map((o) => (
          <FeaturedOrganizerCard key={o.id} organizer={o} />
        ))}
      </Carousel>
    </HomeSection>
  );
}
