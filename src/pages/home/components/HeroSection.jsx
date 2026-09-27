import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useFeaturedEvents } from "@/api";
import { Carousel, HeroBanner } from "@/components/marketplace";
import { Container, ErrorState } from "@/components/site";
import { HeroSkeleton } from "./HomeSkeletons";
import { useCarouselAutoplay } from "./useCarouselAutoplay";

// Tối đa số banner trong hero (GET /events/featured thường chỉ vài sự kiện).
const HERO_MAX = 8;

/**
 * Carousel banner: 2 banner mỗi khung (mobile 1 + mép banner sau), nút ‹ › luôn hiện, chấm trang, tự chuyển 6 giây.
 * Tách riêng để nhịp tự chuyển và nút tạm dừng chỉ render lại component này, không đụng các section khác.
 * Nút tạm dừng (WCAG 2.2.2) nằm cùng hàng chấm, góc phải; người bật "giảm chuyển động" thì không tự chuyển và không có nút.
 */
function HeroCarousel({ events }) {
  const rootRef = useRef(null);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const canAutoplay = !reduce && events.length > 1;
  useCarouselAutoplay(rootRef, { enabled: canAutoplay && !paused });

  return (
    <div ref={rootRef} className="relative">
      <Carousel label="Sự kiện nổi bật" perView="hero" gap="md" arrows="always" dots>
        {events.map((e, i) => (
          <HeroBanner key={e.id} event={e} priority={i < 2} />
        ))}
      </Carousel>
      {canAutoplay ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Tiếp tục tự chuyển banner" : "Tạm dừng tự chuyển banner"}
          className="absolute right-0 bottom-0 grid size-6 cursor-pointer place-items-center rounded-full text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary"
        >
          {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Hero trang chủ (useFeaturedEvents → GET /events/featured). Đang tải → 2 banner chờ; lỗi → báo lỗi gọn + thử lại;
 * không có sự kiện nổi bật → ẩn (các hàng bên dưới vẫn đủ nội dung).
 */
export function HeroSection() {
  const featured = useFeaturedEvents();
  if (featured.isPending) return <div className="pt-5 md:pt-6"><HeroSkeleton /></div>;
  if (featured.isError) {
    return (
      <Container className="pt-5 md:pt-6">
        <ErrorState compact error={featured.error} onRetry={featured.refetch} title="Không tải được sự kiện nổi bật" className="rounded-card bg-card px-5" />
      </Container>
    );
  }
  const events = (featured.data ?? []).slice(0, HERO_MAX);
  if (events.length === 0) return null;
  return (
    // Không bọc <section>: Carousel đã là vùng (region) "Sự kiện nổi bật", tránh đọc tên hai lần.
    <Container className="pt-5 pb-2 md:pt-6">
      <HeroCarousel events={events} />
    </Container>
  );
}
