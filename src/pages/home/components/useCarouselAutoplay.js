import { useEffect } from "react";

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
