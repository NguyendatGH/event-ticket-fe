import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom không có scrollTo (ScrollRestoration gọi khi đổi trang).
window.scrollTo = () => {};

// jsdom không có IntersectionObserver (motion whileInView, InfiniteSentinel dùng).
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// jsdom không có ResizeObserver (SlidingIndicator đo lại khi đổi kích thước).
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});
