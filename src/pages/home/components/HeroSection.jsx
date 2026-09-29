// Tối đa số banner trong hero (GET /events/featured thường chỉ vài sự kiện).

import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useFeaturedEvents } from "@/api";
import { Carousel, HeroBanner } from "@/components/marketplace";
import { Container, ErrorState } from "@/components/site";
import { HeroSkeleton } from "./HomeSkeletons";
import { useCarouselAutoplay } from "./useCarouselAutoplay";

const HERO_MAX = 8;

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
    <Container className="pt-5 pb-2 md:pt-6">
      <HeroCarousel events={events} />
    </Container>
  );
}
