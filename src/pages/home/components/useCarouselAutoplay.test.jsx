import { useRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCarouselAutoplay } from "./useCarouselAutoplay";

function Harness({ enabled = true }) {
  const ref = useRef(null);
  useCarouselAutoplay(ref, { enabled, interval: 1000 });
  return (
    <div ref={ref} data-testid="root">
      <div aria-roledescription="carousel">
        <div data-testid="track" />
      </div>
    </div>
  );
}

function setupTrack(getByTestId, { scrollLeft = 0 } = {}) {
  const track = getByTestId("track");
  Object.defineProperties(track, {
    clientWidth: { value: 1000, configurable: true },
    scrollWidth: { value: 3000, configurable: true },
    scrollLeft: { value: scrollLeft, configurable: true, writable: true },
  });
  track.scrollBy = vi.fn();
  track.scrollTo = vi.fn();
  return track;
}

describe("useCarouselAutoplay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("cuộn sang trang kế sau mỗi nhịp; tới cuối thì quay về đầu", () => {
    const { getByTestId } = render(<Harness />);
    const track = setupTrack(getByTestId);
    vi.advanceTimersByTime(1000);
    expect(track.scrollBy).toHaveBeenCalledWith({ left: 900, behavior: "smooth" });
    track.scrollLeft = 2000;
    vi.advanceTimersByTime(1000);
    expect(track.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: "smooth" });
  });

  it("dừng khi rê chuột hoặc focus bên trong, chạy lại khi rời đi", () => {
    const { getByTestId } = render(<Harness />);
    const track = setupTrack(getByTestId);
    const root = getByTestId("root");
    fireEvent.pointerEnter(root);
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).not.toHaveBeenCalled();
    fireEvent.pointerLeave(root);
    fireEvent.focusIn(root);
    vi.advanceTimersByTime(3000);
    expect(track.scrollBy).not.toHaveBeenCalled();
    fireEvent.focusOut(root, { relatedTarget: null });
    vi.advanceTimersByTime(1000);
    expect(track.scrollBy).toHaveBeenCalledTimes(1);
  });

  it("enabled = false (tạm dừng / giảm chuyển động) → không tự cuộn", () => {
    const { getByTestId } = render(<Harness enabled={false} />);
    const track = setupTrack(getByTestId);
    vi.advanceTimersByTime(5000);
    expect(track.scrollBy).not.toHaveBeenCalled();
  });
});
