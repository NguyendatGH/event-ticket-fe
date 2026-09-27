/**
 * Khối giao diện v2 "marketplace" (design-spec.md mục v2) cho trang chủ, khu tài khoản và các trang làm lại theo v2.
 * Luôn import qua barrel này:
 *   import { Carousel, SectionTitle, PosterCard } from "@/components/marketplace";
 * Khung trang (Header xanh, CategoryNav đen, Footer) nằm ở @/components/site và đã gắn sẵn trong SiteLayout.
 */

// Bố cục
export { Carousel } from "./Carousel";
export { SectionTitle } from "./SectionTitle";
export { GlowWaves } from "./GlowWaves";

// Thẻ sự kiện
export { HeroBanner } from "./HeroBanner";
export { PosterCard } from "./PosterCard";
export { EventTile } from "./EventTile";
export { RankedEventCard } from "./RankedEventCard";
export { EventCaption } from "./EventCaption";
export { CLOSED_STATUSES } from "./eventStatus";

// Ban tổ chức, địa điểm
export { FeaturedOrganizerCard } from "./FeaturedOrganizerCard";
export { VerifiedBadge } from "./VerifiedBadge";
export { CityTile } from "./CityTile";
