import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EventsManagePage from "./EventsManagePage";
import EventEditorPage from "./EventEditorPage";

const api = vi.hoisted(() => ({
  useInfiniteOrganizerEvents: vi.fn(),
  useDashboardSummary: vi.fn(),
  useDeleteOrganizerEvent: vi.fn(),
  usePublishOrganizerEvent: vi.fn(),
  useOrganizerEvent: vi.fn(),
  useCreateOrganizerEvent: vi.fn(),
  useUpdateOrganizerEvent: vi.fn(),
}));
vi.mock("@/api", async (orig) => ({ ...(await orig()), ...api }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const mutation = (over = {}) => ({ mutate: vi.fn(), mutateAsync: vi.fn(), reset: vi.fn(), isPending: false, ...over });
const page = (content) => ({ content, number: 0, size: 12, totalElements: content.length, totalPages: 1 });
const EVENT = {
  id: "ev-1",
  slug: "the-lumiere-tour",
  name: "The Lumière Tour",
  category: "music",
  status: "PUBLISHED",
  startsAt: "2026-10-24T12:00:00Z",
  endsAt: null,
  venue: { name: "Mỹ Đình", city: "Hà Nội", address: null },
  coverImageUrl: null,
  ticketsSold: 820,
  ticketsTotal: 1000,
  revenue: 420000000,
};

function renderAt(path, routes) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

beforeEach(() => {
  vi.clearAllMocks();
  api.useDashboardSummary.mockReturnValue({ data: { events: { total: 3, draft: 1, published: 2, upcoming: 0, ended: 0 } } });
  api.useDeleteOrganizerEvent.mockReturnValue(mutation());
  api.usePublishOrganizerEvent.mockReturnValue(mutation());
  api.useUpdateOrganizerEvent.mockReturnValue(mutation());
  api.useOrganizerEvent.mockReturnValue({ isPending: false, data: undefined });
});

describe("EventsManagePage", () => {
  const routes = [{ path: "/organizer/events", element: <EventsManagePage /> }];

  it("hiện dòng sự kiện với vé bán, doanh thu, và đổi tab ghi lên URL", async () => {
    api.useInfiniteOrganizerEvents.mockReturnValue({ isPending: false, data: { pages: [page([EVENT])] } });
    const router = renderAt("/organizer/events", routes);
    const list = screen.getByRole("list", { name: "Danh sách sự kiện" });
    expect(within(list).getByRole("link", { name: "The Lumière Tour" })).toHaveAttribute("href", "/organizer/events/ev-1");
    expect(within(list).getAllByText("420.000.000đ").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("tab", { name: /Bản nháp/ }));
    expect(router.state.location.search).toBe("?status=DRAFT");
    expect(api.useInfiniteOrganizerEvents).toHaveBeenCalledWith(expect.objectContaining({ status: "DRAFT" }));
  });

  it("chưa có sự kiện → CTA tạo sự kiện đầu tiên", () => {
    api.useInfiniteOrganizerEvents.mockReturnValue({ isPending: false, data: { pages: [page([])] } });
    renderAt("/organizer/events", routes);
    expect(screen.getByRole("link", { name: "Tạo sự kiện đầu tiên" })).toHaveAttribute("href", "/organizer/events/new");
  });
});

describe("EventEditorPage", () => {
  const routes = [
    { path: "/organizer/events/new", element: <EventEditorPage /> },
    { path: "/organizer/events/:id/edit", element: <EventEditorPage /> },
  ];

  it("lưu nháp: thiếu tên → báo lỗi, không gọi API", async () => {
    const create = mutation();
    api.useCreateOrganizerEvent.mockReturnValue(create);
    renderAt("/organizer/events/new", routes);
    await userEvent.click(screen.getAllByRole("button", { name: "Lưu nháp" })[0]);
    await waitFor(() => expect(screen.getByLabelText("Tên sự kiện")).toHaveAttribute("aria-invalid", "true"));
    expect(screen.getByLabelText("Tên sự kiện")).toHaveAccessibleDescription("Tên sự kiện là bắt buộc");
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });

  it("lưu nháp chỉ với tên → POST rồi chuyển sang trang sửa", async () => {
    const detail = { id: "ev-9", name: "Đêm nhạc Mùa thu", status: "DRAFT", tiers: [], description: [], schedule: [] };
    const create = mutation({ mutateAsync: vi.fn().mockResolvedValue(detail) });
    api.useCreateOrganizerEvent.mockReturnValue(create);
    api.useOrganizerEvent.mockImplementation((id) => ({ isPending: false, data: id ? detail : undefined }));
    const router = renderAt("/organizer/events/new", routes);
    await userEvent.type(screen.getByLabelText("Tên sự kiện"), "Đêm nhạc Mùa thu");
    await userEvent.click(screen.getAllByRole("button", { name: "Lưu nháp" })[0]);
    await waitFor(() => expect(create.mutateAsync).toHaveBeenCalledTimes(1));
    expect(create.mutateAsync.mock.calls[0][0]).toMatchObject({ name: "Đêm nhạc Mùa thu", tiers: [], description: [] });
    await waitFor(() => expect(router.state.location.pathname).toBe("/organizer/events/ev-9/edit"));
  });

  it("xuất bản khi thiếu thông tin → không gọi API, chuyển tới bước có lỗi đầu tiên", async () => {
    const create = mutation();
    api.useCreateOrganizerEvent.mockReturnValue(create);
    const router = renderAt("/organizer/events/new?step=4", routes);
    await userEvent.click(screen.getAllByRole("button", { name: "Xuất bản" })[0]);
    await waitFor(() => expect(router.state.location.search).toBe("?step=1"));
    expect(create.mutateAsync).not.toHaveBeenCalled();
  });
});
