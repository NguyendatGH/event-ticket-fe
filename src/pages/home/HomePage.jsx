/**
 * Trang chủ, route "/" (design-spec.md mục v2 — marketplace). Header xanh + thanh danh mục đen + footer do SiteLayout lo.
 * Từ trên xuống, mỗi section tự gọi hook dữ liệu của riêng nó (chạy song song; section lỗi chỉ báo lỗi ở chỗ nó,
 * section rỗng tự ẩn; khung chờ cùng hình dạng thẻ thật):
 *   HeroSection                 useFeaturedEvents        GET /events/featured          2 banner / khung, tự chuyển
 *   FeaturedOrganizersSection   useFeaturedOrganizers    GET /organizers?size=12       thẻ avatar phát sáng trên GlowWaves
 *   SpecialEventsSection        featured + upcoming      GET /events/upcoming?limit=12 poster dọc
 *   TrendingSection             useEvents                GET /events?sort=popular      thẻ có số hạng 1..10
 *   CategoryRows                useEvents × nhóm         GET /events?category=…        4 hàng thẻ ngang
 *   ResaleSection               useResaleListings        GET /resale?size=8            ẩn khi chưa có tin
 *   DestinationsSection         useEventFacets           GET /events/facets            ô thành phố gradient xanh
 *   OrganizerCta                (useAuth, không gọi API)                                nút theo vai trò
 */
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CategoryRows } from "./components/CategoryRows";
import { DestinationsSection } from "./components/DestinationsSection";
import { FeaturedOrganizersSection } from "./components/FeaturedOrganizersSection";
import { HeroSection } from "./components/HeroSection";
import { OrganizerCta } from "./components/OrganizerCta";
import { ResaleSection } from "./components/ResaleSection";
import { SpecialEventsSection } from "./components/SpecialEventsSection";
import { TrendingSection } from "./components/TrendingSection";

export default function HomePage() {
  useDocumentTitle();
  return (
    <>
      <h1 className="sr-only">Trang chủ</h1>
      <HeroSection />
      <FeaturedOrganizersSection />
      <SpecialEventsSection />
      <TrendingSection />
      <CategoryRows />
      <ResaleSection />
      <DestinationsSection />
      <OrganizerCta />
    </>
  );
}
