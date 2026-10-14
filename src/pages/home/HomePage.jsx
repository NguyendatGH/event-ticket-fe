import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CategoryRows } from "./components/CategoryRows";
import { DestinationsSection } from "./components/DestinationsSection";
import { FeaturedOrganizersSection } from "./components/FeaturedOrganizersSection";
import { HeroSection } from "./components/HeroSection";
import { OrganizerCta } from "./components/OrganizerCta";
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
      <DestinationsSection />
      <OrganizerCta />
    </>
  );
}
