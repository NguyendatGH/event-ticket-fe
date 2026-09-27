import { Children, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Carousel ngang không thư viện: CSS scroll-snap + nút ‹ › + chấm trang (IntersectionObserver).
 *
 *   <Carousel label="Sự kiện đặc biệt" perView="poster">
 *     {events.map((e) => <PosterCard key={e.id} event={e} />)}
 *   </Carousel>
 *
 * Props
 *   label        tên vùng cho trình đọc màn hình (bắt buộc)
 *   perView      số thẻ mỗi khung: preset "hero" | "poster" | "featured" | "tile" | "ranked" | "city", hoặc chuỗi class tự đặt
 *                biến CSS --pv theo breakpoint, vd "[--pv:1.2] md:[--pv:3]" (số lẻ = thẻ cuối lộ một phần, gợi ý cuộn)
 *   gap          "sm" 12px | "md" 16px (mặc định) | "lg" 20px
 *   arrows       "hover" (mặc định: hiện khi rê chuột / focus) | "always" | false. Máy cảm ứng: ẩn, vuốt tay.
 *   arrowClassName  chỉnh vị trí dọc nút (mặc định top-1/2), vd "top-[38%]" khi dưới ảnh còn chú thích
 *   dots         hiện chấm trang dưới carousel (hero)
 *   className, trackClassName
 *
 * Vì sao như vậy
 * - Độ rộng thẻ tính bằng CSS từ --pv/--gap nên không đo DOM, không nhảy layout lúc tải.
 * - IntersectionObserver (root = track) báo thẻ nào đang hiện → bật/tắt nút, tính chấm trang; không nghe sự kiện
 *   scroll nên cuộn không render lại. setState chỉ khi giá trị đổi.
 * - Bàn phím: nút ‹ › focus được (hiện ra khi focus); Tab qua link trong thẻ thì trình duyệt tự cuộn thẻ vào khung.
 * - prefers-reduced-motion: cuộn tức thì thay vì cuộn mượt.
 */
const PER_VIEW = {
  hero: "[--pv:1.08] md:[--pv:2]",
  poster: "[--pv:2.2] sm:[--pv:3.3] md:[--pv:4] lg:[--pv:4.5]",
  featured: "[--pv:2.4] sm:[--pv:3.5] md:[--pv:5] lg:[--pv:7.4]",
  tile: "[--pv:1.25] sm:[--pv:2.2] lg:[--pv:3]",
  ranked: "[--pv:1.7] sm:[--pv:2.6] md:[--pv:3.4] lg:[--pv:4.4]",
  city: "[--pv:1.5] sm:[--pv:2.5] lg:[--pv:4]",
};
const GAP = { sm: "[--gap:0.75rem]", md: "[--gap:1rem]", lg: "[--gap:1.25rem]" };
// Hằng số ngoài component: không tạo object style mới mỗi lần render.
const ITEM_STYLE = { width: "calc((100% - (var(--pv) - 1) * var(--gap)) / var(--pv))" };
const INITIAL = { canPrev: false, canNext: false, page: 0, pages: 1, perView: 1 };
const same = (a, b) => a.canPrev === b.canPrev && a.canNext === b.canNext && a.page === b.page && a.pages === b.pages && a.perView === b.perView;

function ArrowButton({ dir, onClick, disabled, mode, className }) {
  const Icon = dir < 0 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? "Xem mục trước" : "Xem mục tiếp theo"}
      className={cn(
        "absolute z-10 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-sm transition-[opacity,background-color] duration-200 hover:bg-black/80",
        "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary pointer-coarse:hidden",
        dir < 0 ? "left-2" : "right-2",
        mode === "hover" && "opacity-0 group-hover/carousel:opacity-100",
        "disabled:pointer-events-none disabled:opacity-0",
        className
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

export function Carousel({ label, perView = "poster", gap = "md", arrows = "hover", arrowClassName = "top-1/2", dots = false, className, trackClassName, children }) {
  const items = Children.toArray(children).filter(Boolean);
  const count = items.length;
  const trackRef = useRef(null);
  const [state, setState] = useState(INITIAL);
  const reduce = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0 || typeof IntersectionObserver === "undefined") return;
    const ratios = new Array(count).fill(0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios[Number(e.target.dataset.index)] = e.intersectionRatio;
        const visible = [];
        ratios.forEach((r, i) => r >= 0.55 && visible.push(i));
        const perViewNow = Math.max(1, visible.length);
        const pages = Math.max(1, Math.ceil(count / perViewNow));
        const atEnd = ratios[count - 1] >= 0.95;
        const page = atEnd ? pages - 1 : Math.min(pages - 1, Math.round((visible[0] ?? 0) / perViewNow));
        const next = { canPrev: ratios[0] < 0.95, canNext: !atEnd, page, pages, perView: perViewNow };
        setState((prev) => (same(prev, next) ? prev : next));
      },
      { root: track, threshold: [0, 0.55, 0.95] }
    );
    Array.from(track.children).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [count]);

  const behavior = reduce ? "auto" : "smooth";
  const scrollPage = (dir) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior });
  };
  const goToPage = (page) => {
    const track = trackRef.current;
    const target = track?.children[Math.min(count - 1, page * state.perView)];
    if (target) track.scrollTo({ left: target.offsetLeft - track.firstElementChild.offsetLeft, behavior });
  };

  if (count === 0) return null;
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={cn("group/carousel relative", PER_VIEW[perView] ?? perView, GAP[gap] ?? GAP.md, className)}>
      <div
        ref={trackRef}
        className={cn(
          // px/-mx + py/-my: chừa chỗ cho viền focus và bóng glow của thẻ (overflow cắt mất nếu sát mép).
          "relative -mx-2 flex snap-x snap-mandatory scroll-px-2 gap-(--gap) overflow-x-auto overscroll-x-contain px-2 py-2 -my-2 no-scrollbar",
          trackClassName
        )}
      >
        {items.map((child, i) => (
          <div key={child.key ?? i} data-index={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${count}`} className="shrink-0 snap-start" style={ITEM_STYLE}>
            {child}
          </div>
        ))}
      </div>

      {arrows ? (
        <>
          <ArrowButton dir={-1} mode={arrows} onClick={() => scrollPage(-1)} disabled={!state.canPrev} className={arrowClassName} />
          <ArrowButton dir={1} mode={arrows} onClick={() => scrollPage(1)} disabled={!state.canNext} className={arrowClassName} />
        </>
      ) : null}

      {dots && state.pages > 1 ? (
        <div className="mt-3 flex justify-center gap-1">
          {Array.from({ length: state.pages }, (_, p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-label={`Trang ${p + 1} / ${state.pages}`}
              aria-current={p === state.page ? "true" : undefined}
              className="group/dot grid size-6 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 rounded-full transition-colors duration-300 ease-out-quint",
                  p === state.page ? "w-5 bg-primary" : "w-2 bg-white/45 group-hover/dot:bg-white/80"
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
