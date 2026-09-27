import { Carousel } from "@/components/marketplace";
import { Container } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { TILE_ROW } from "./layout";

/**
 * Khung chờ của từng section trang chủ, cùng hình dạng với thẻ thật để dữ liệu về không làm nhảy layout.
 * Dùng chính <Carousel> (không nút, không chấm) nên độ rộng mỗi ô khớp đúng preset perView của hàng thật.
 *
 *   <RowSkeleton kind="poster" />   "poster" | "tile" | "ranked" | "featured"
 *   <HeroSkeleton />
 */

// Số ô giả mỗi hàng: đủ lấp một khung nhìn desktop (và lộ một phần ô kế tiếp như hàng thật).
const COUNT = { poster: 5, tile: 5, ranked: 5, featured: 8 };
const PER_VIEW = { poster: "poster", tile: TILE_ROW, ranked: "ranked", featured: "featured" };

/** Hai dòng chú thích dưới ảnh (tên + ngày/giá), như EventCaption. */
function CaptionLines({ className }) {
  return (
    <div className={className}>
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

function Cell({ kind }) {
  if (kind === "featured") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-white/8 px-3 pt-4 pb-3.5">
        <Skeleton className="aspect-square w-full max-w-28 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  if (kind === "ranked") {
    return (
      <div>
        <div className="flex items-end">
          <span className="w-10 shrink-0 md:w-14" />
          <Skeleton className="aspect-poster flex-1 rounded-card" />
        </div>
        <CaptionLines className="pl-12 md:pl-16" />
      </div>
    );
  }
  return (
    <div>
      <Skeleton className={kind === "tile" ? "aspect-wide rounded-card" : "aspect-poster rounded-poster"} />
      <CaptionLines />
    </div>
  );
}

/** Khung chờ một hàng carousel. aria-hidden: section cha đã có aria-busy. */
export function RowSkeleton({ kind = "poster" }) {
  return (
    <div aria-hidden="true">
      <Carousel label="Đang tải" perView={PER_VIEW[kind]} gap={kind === "featured" ? "sm" : "md"} arrows={false}>
        {Array.from({ length: COUNT[kind] }, (_, i) => (
          <Cell key={i} kind={kind} />
        ))}
      </Carousel>
    </div>
  );
}

/** Khung chờ hero: 2 banner 16:9 (mobile 1 banner + mép banner sau) và hàng chấm. */
export function HeroSkeleton() {
  return (
    <Container aria-busy="true" aria-label="Đang tải sự kiện nổi bật">
      <div aria-hidden="true">
        <Carousel label="Đang tải" perView="hero" arrows={false}>
          <Skeleton className="aspect-banner rounded-card" />
          <Skeleton className="aspect-banner rounded-card" />
        </Carousel>
        <div className="mt-3 flex h-6 items-center justify-center gap-2">
          <Skeleton className="h-2 w-5 rounded-full" />
          <Skeleton className="size-2 rounded-full" />
        </div>
      </div>
    </Container>
  );
}
