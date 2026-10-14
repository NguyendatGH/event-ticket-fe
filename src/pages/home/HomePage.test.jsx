import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/auth";

const ev = (id, extra = {}) => ({
  id,
  slug: `su-kien-${id}`,
  name: `Sự kiện ${id}`,
  category: "music",
  startsAt: "2026-10-24T12:00:00Z",
  venue: { name: "Nhà hát", city: "Hà Nội" },
  coverImageUrl: `https://images.unsplash.com/photo-${id}?w=1600`,
  priceFrom: 100000,
  status: "PUBLISHED",
  ...extra,
});
const ok = (data) => ({ data, isPending: false, isError: false, fetchStatus: "idle", error: null, refetch: vi.fn() });
const loading = () => ({ data: undefined, isPending: true, isError: false, fetchStatus: "fetching", error: null, refetch: vi.fn() });
const failed = (message) => ({ data: undefined, isPending: false, isError: true, fetchStatus: "idle", error: { message }, refetch: vi.fn() });
const page = (content) => ({ content, number: 0, size: content.length, totalElements: content.length, totalPages: 1 });

let state;
const defaultState = () => ({
  featured: ok([ev("f1"), ev("f2"), ev("f3")]),
  upcoming: ok([ev("f2"), ev("u1")]),
  organizers: ok([{ id: "o1", slug: "sunrise-live", name: "Sunrise Live", verified: true }]),
  popular: ok(page([ev("p1"), ev("p2")])),
  byCategory: {
    music: ok(page([ev("m1")])),
    theatre: ok(page([ev("t1", { startsAt: "2026-12-01T12:00:00Z" })])),
    exhibition: ok(page([ev("x1", { startsAt: "2026-10-01T12:00:00Z" })])),
    sport: ok(page([])),
    conference: ok(page([])),
    workshop: ok(page([])),
  },
  facets: ok({ cities: [{ name: "Hà Nội", count: 5 }] }),
});

vi.mock("@/api", async (orig) => ({
  ...(await orig()),
  useFeaturedEvents: () => state.featured,
  useUpcomingEvents: () => state.upcoming,
  useFeaturedOrganizers: () => state.organizers,
  useEvents: (params) => (params.sort === "popular" ? state.popular : state.byCategory[params.category]),
  useEventFacets: () => state.facets,
  useAppConfig: () => ({ checkoutFee: 12000 }),
}));

const { default: HomePage } = await import("./HomePage");

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
const section = (name) => screen.getByRole("region", { name });

describe("HomePage", () => {
  beforeEach(() => {
    state = defaultState();
  });
  afterEach(() => useAuthStore.getState().clear());

  it("hero: banner nổi bật link tới trang sự kiện, có nút Xem chi tiết và chấm trang", () => {
    renderPage();
    const hero = screen.getByRole("region", { name: "Sự kiện nổi bật" });
    const links = within(hero).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/events/su-kien-f1", "/events/su-kien-f2", "/events/su-kien-f3"]);
    expect(links[0]).toHaveTextContent("Xem chi tiết");
  });

  it("hero có nút tạm dừng / tiếp tục tự chuyển banner", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "Tạm dừng tự chuyển banner" }));
    expect(screen.getByRole("button", { name: "Tiếp tục tự chuyển banner" })).toBeInTheDocument();
  });

  it("các section chính hiện đúng dữ liệu và link Xem thêm", () => {
    renderPage();
    expect(within(section("Ban tổ chức nổi bật")).getByRole("link", { name: /Sunrise Live/ })).toHaveAttribute("href", "/organizers/sunrise-live");

    const special = within(section("Sự kiện đặc biệt")).getAllByRole("heading", { level: 3 });
    expect(special.map((h) => h.textContent)).toEqual(["Sự kiện f1", "Sự kiện f2", "Sự kiện f3", "Sự kiện u1"]);

    const trending = section("Sự kiện xu hướng");
    const ranked = within(screen.getByRole("region", { name: "Danh sách sự kiện xu hướng" })).getAllByRole("link");
    expect(ranked[0]).toHaveTextContent("Hạng 1:");
    expect(ranked[1]).toHaveTextContent("Hạng 2:");
    expect(within(trending).getByRole("link", { name: "Xem thêm" })).toHaveAttribute("href", "/events?sort=popular");
  });

  it("hàng danh mục gộp 2 danh mục, sắp theo ngày; hàng rỗng ẩn", () => {
    renderPage();
    const arts = section("Sân khấu & Nghệ thuật");
    expect(within(arts).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Sự kiện x1", "Sự kiện t1"]);
    expect(within(arts).getByRole("link", { name: "Xem thêm" })).toHaveAttribute("href", "/events?category=theatre");
    expect(screen.getByRole("region", { name: "Nhạc sống" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Thể thao" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hội thảo & Workshop" })).not.toBeInTheDocument();
  });

  it("điểm đến: link lọc theo thành phố, số sự kiện từ facets, ô Vị trí khác", () => {
    renderPage();
    const dest = screen.getByRole("heading", { name: "Điểm đến thú vị" }).closest("section");
    expect(within(dest).getByRole("link", { name: /Hà Nội/ })).toHaveAttribute("href", "/events?city=H%C3%A0%20N%E1%BB%99i");
    expect(within(dest).getByText("5 sự kiện")).toBeInTheDocument();
    expect(within(dest).getByRole("link", { name: /Vị trí khác/ })).toHaveAttribute("href", "/events");
  });

  it("lỗi một section chỉ báo lỗi ở section đó, bấm Thử lại gọi refetch; section khác vẫn hiện", async () => {
    state.popular = failed("Lỗi máy chủ");
    state.organizers = failed("Mất kết nối");
    renderPage();
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(screen.getByText('Không tải được mục "Sự kiện xu hướng"')).toBeInTheDocument();
    expect(screen.getByText("Lỗi máy chủ")).toBeInTheDocument();
    const trending = screen.getByRole("heading", { name: /Sự kiện xu hướng/ }).closest("section");
    await userEvent.click(within(trending).getByRole("button", { name: "Thử lại" }));
    expect(state.popular.refetch).toHaveBeenCalledTimes(1);
    expect(section("Sự kiện đặc biệt")).toBeInTheDocument();
    expect(section("Nhạc sống")).toBeInTheDocument();
  });

  it("đang tải: section đánh dấu aria-busy, chưa hiện link Xem thêm", () => {
    state.popular = loading();
    state.organizers = loading();
    renderPage();
    const trending = screen.getByRole("heading", { name: /Sự kiện xu hướng/ }).closest("section");
    expect(trending).toHaveAttribute("aria-busy", "true");
    expect(within(trending).queryByRole("link", { name: "Xem thêm" })).not.toBeInTheDocument();
  });

  it("nút kêu gọi ban tổ chức đổi theo vai trò", () => {
    const { unmount } = renderPage();
    expect(screen.getByRole("link", { name: /Trở thành nhà tổ chức/ })).toHaveAttribute("href", "/auth/register-organizer");
    unmount();

    useAuthStore.setState({ accessToken: "t", refreshToken: "r", expiresAt: Date.now() + 600_000, user: { id: "u", role: "CUSTOMER", fullName: "Lê Thu Hà" } });
    const second = renderPage();
    expect(screen.getByRole("link", { name: /Trở thành nhà tổ chức/ })).toHaveAttribute("href", "/become-organizer");
    second.unmount();

    useAuthStore.setState({ user: { id: "u", role: "ORGANIZER", fullName: "Trần Quốc Bảo", organizer: { slug: "sunrise-live" } } });
    renderPage();
    expect(screen.getByRole("link", { name: /Vào trang quản lý/ })).toHaveAttribute("href", "/organizer");
  });
});
