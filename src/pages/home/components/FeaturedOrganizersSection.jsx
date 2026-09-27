import { Star } from "lucide-react";
import { useFeaturedOrganizers } from "@/api";
import { Carousel, FeaturedOrganizerCard, GlowWaves } from "@/components/marketplace";
import { sectionStatus } from "../lib";
import { HomeSection } from "./HomeSection";
import { RowSkeleton } from "./HomeSkeletons";

/**
 * "Ban tổ chức nổi bật" (useFeaturedOrganizers(12) → GET /organizers?size=12): hàng thẻ avatar tròn viền phát sáng
 * trên nền sóng ánh sáng xanh (GlowWaves, chỉ dùng một lần trên trang). Chưa có BTC nào → ẩn.
 */
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
      // py lớn hơn các section khác để sóng sáng có chỗ lan ra trên/dưới hàng thẻ như tham chiếu
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
