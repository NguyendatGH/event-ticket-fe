// Test trang danh sách sự kiện và bộ lọc trên URL.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useInfiniteEvents = vi.fn();
vi.mock("@/api", async (orig) => ({
  ...(await orig()),
  useInfiniteEvents: (...a) => useInfiniteEvents(...a),
  useEventFacets: () => ({
    isPending: false,
    data: {
      categories: [{ slug: "music", count: 7 }],
      cities: [{ name: "Hà Nội", count: 5 }],
      price: { min: 0, max: 2500000 },
    },
  }),
}));
const { default: EventsPage } = await import("./EventsPage");

const ev = (i) => ({
  id: `e${i}`,
  slug: `s${i}`,
  name: `Sự kiện ${i}`,
  startsAt: "2026-10-24T12:00:00Z",
  venue: { name: "Nhà hát", city: "Hà Nội" },
  priceFrom: 300000,
  status: "PUBLISHED",
});
const result = (content, total = content.length) => ({
  isPending: false,
  isError: false,
  data: {
    pages: [
      { content, number: 0, size: 12, totalElements: total, totalPages: 1 },
    ],
  },
  hasNextPage: false,
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
});

function renderAt(url) {
  const router = createMemoryRouter(
    [{ path: "/events", element: <EventsPage /> }],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("EventsPage", () => {
  beforeEach(() => useInfiniteEvents.mockReset());

  it("đọc bộ lọc từ URL, hiện số kết quả, chọn danh mục ghi lên URL", async () => {
    useInfiniteEvents.mockReturnValue(result([ev(1), ev(2)], 24));
    const user = userEvent.setup();
    const router = renderAt("/events?city=H%C3%A0%20N%E1%BB%99i&sort=price");
    expect(useInfiniteEvents.mock.calls[0][0]).toMatchObject({
      city: "Hà Nội",
      sort: "price",
      category: "",
    });
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Sự kiện 1")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /Âm nhạc/ })[0]);
    expect(
      new URLSearchParams(router.state.location.search).get("category"),
    ).toBe("music");
    expect(
      screen.getByRole("heading", { level: 1, name: "Âm nhạc" }),
    ).toBeInTheDocument();
  });

  it("không có kết quả: gợi ý xóa bộ lọc, bấm thì bỏ bộ lọc nhưng giữ sort", async () => {
    useInfiniteEvents.mockReturnValue(result([]));
    const user = userEvent.setup();
    const router = renderAt("/events?q=abc&category=music&sort=-price");
    expect(
      screen.getByText('Không tìm thấy sự kiện cho "abc"'),
    ).toBeInTheDocument();
    await user.click(
      screen.getAllByRole("button", { name: "Xóa bộ lọc" }).at(-1),
    );
    expect(router.state.location.search).toBe("?sort=-price");
  });
});
