// Ảnh cố định cho từng thành phố (Unsplash, đã kiểm tra đúng địa danh; imageAt trong CityTile đặt lại cỡ).

import { MapPin } from "lucide-react";
import { useEventFacets } from "@/api";
import { CityTile } from "@/components/marketplace";
import { HomeSection } from "./HomeSection";

const UNSPLASH = "https://images.unsplash.com/";

const CITY_TILES = [
  { name: "TP.HCM", src: `${UNSPLASH}photo-1583417319070-4a69db38a482?w=800`, alt: "Toà nhà Bitexco và các cao ốc bên sông Sài Gòn lúc hoàng hôn" },
  { name: "Hà Nội", src: `${UNSPLASH}photo-1509030450996-dd1a26dda07a?w=800`, alt: "Nhà cao tầng Hà Nội dưới bầu trời chiều" },
  { name: "Đà Nẵng", src: `${UNSPLASH}photo-1559592413-7cec4d0cae2b?w=800`, alt: "Cầu Vàng trên núi Bà Nà, Đà Nẵng" },
];
const OTHER_IMAGES = [
  { src: `${UNSPLASH}photo-1528127269322-539801943592?w=400` },
  { src: `${UNSPLASH}photo-1557750255-c76072a7aad1?w=400` },
  { src: `${UNSPLASH}photo-1504457047772-27faf1c00561?w=400` },
  { src: `${UNSPLASH}photo-1540611025311-01df3cef54b5?w=400` },
];

export function DestinationsSection() {
  const facets = useEventFacets();
  const counts = new Map((facets.data?.cities ?? []).map((c) => [c.name, c.count]));
  return (
    <HomeSection id="home-destinations" title="Điểm đến thú vị" icon={MapPin}>
      <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {CITY_TILES.map((c) => (
          <li key={c.name}>
            <CityTile
              name={c.name}
              href={`/events?city=${encodeURIComponent(c.name)}`}
              image={{ src: c.src, alt: c.alt }}
              count={counts.get(c.name)}
            />
          </li>
        ))}
        <li>
          <CityTile name="Vị trí khác" href="/events" images={OTHER_IMAGES} />
        </li>
      </ul>
    </HomeSection>
  );
}
