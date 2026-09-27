import { useEffect } from "react";

/**
 * Tự cuộn <Carousel> sang trang kế sau mỗi `interval` ms, hết thì quay về đầu.
 * Chỉ thao tác scrollLeft của track (DOM), không setState → component cha không render lại theo nhịp.
 *
 *   const rootRef = useRef(null);
 *   useCarouselAutoplay(rootRef, { enabled: !paused && !reduceMotion });
 *   <div ref={rootRef}><Carousel …/></div>
 *
 * Tự dừng khi: rê chuột / chạm vào carousel, focus bàn phím bên trong, tab trình duyệt ẩn,
 * carousel ra khỏi màn hình. `enabled` = false (nút tạm dừng, prefers-reduced-motion) → không chạy.
 * Track = phần tử cuộn ngang đầu tiên trong vùng carousel (Carousel ở @/components/marketplace).
 */
export function useCarouselAutoplay(rootRef, { enabled = true, interval = 6000 } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    const track = root?.querySelector('[aria-roledescription="carousel"] > div');
    if (!enabled || !root || !track) return;

    let hovering = false;
    let focused = false;
    let onScreen = true;
    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    const onFocusIn = () => (focused = true);
    const onFocusOut = (e) => (focused = root.contains(e.relatedTarget));
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0.4 });
    io?.observe(root);

    const timer = window.setInterval(() => {
      if (hovering || focused || !onScreen || document.hidden) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
      // 0.9 khung như nút ›; scroll-snap kéo về đúng đầu thẻ kế tiếp.
      else track.scrollBy({ left: track.clientWidth * 0.9, behavior: "smooth" });
    }, interval);

    return () => {
      window.clearInterval(timer);
      io?.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [rootRef, enabled, interval]);
}
