import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import * as ordersApi from "@/api/services/orders";
import * as authApi from "@/api/services/auth";
import * as usersApi from "@/api/services/users";
import { useAuthStore } from "@/stores/auth";
import MyOrdersPage from "./MyOrdersPage";
import ProfilePage from "./ProfilePage";
import BecomeOrganizerPage from "./BecomeOrganizerPage";
import AccountLayout from "@/layouts/AccountLayout";
import { dateTile, orderFilterOf, ticketCount } from "./lib";

vi.mock("@/api/services/orders", async (orig) => ({ ...(await orig()), mine: vi.fn() }));
vi.mock("@/api/services/auth", async (orig) => ({ ...(await orig()), me: vi.fn() }));
vi.mock("@/api/services/users", async (orig) => ({ ...(await orig()), changePassword: vi.fn(), updateMe: vi.fn() }));

const customer = { id: "u1", fullName: "Lê Thu Hà", email: "a@example.com", role: "CUSTOMER", phone: null, bio: null, avatarUrl: null, createdAt: "2026-03-14T08:21:00Z", organizer: null };
const order = { id: "o1", orderCode: 1727430912, status: "PAID", kind: "PRIMARY", eventName: "The Lumière Tour", items: [{ quantity: 2 }, { quantity: 1 }], totalAmount: 2412000, createdAt: "2026-09-20T12:00:00Z" };

function renderPage(element, path) {
  const router = createMemoryRouter(
    [
      { path, element },
      { path: "*", element: <p>đích</p> },
    ],
    { initialEntries: [path] }
  );
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}
const login = (user) => useAuthStore.setState({ accessToken: "t", refreshToken: "r", expiresAt: Date.now() + 600_000, user });

afterEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clear();
});

describe("MyOrdersPage", () => {
  it("liệt kê đơn với tổng vé và link tới đơn", async () => {
    ordersApi.mine.mockResolvedValue({ content: [order], number: 0, size: 12, totalElements: 1, totalPages: 1 });
    renderPage(<MyOrdersPage />, "/me/orders");
    const link = await screen.findByRole("link", { name: /The Lumière Tour/ });
    expect(link).toHaveAttribute("href", "/orders/o1");
    expect(within(link).getByText("#1727430912")).toBeInTheDocument();
    expect(within(link).getByText("Đã thanh toán")).toBeInTheDocument();
    expect(ticketCount(order)).toBe(3);
  });

  it("tab trạng thái ghi ?status= lên URL và gửi status lên API (Đã hủy = CANCELLED,EXPIRED)", async () => {
    ordersApi.mine.mockResolvedValue({ content: [order], number: 0, size: 24, totalElements: 1, totalPages: 1 });
    const router = renderPage(<MyOrdersPage />, "/me/orders");
    await screen.findByRole("link", { name: /The Lumière Tour/ });
    expect(ordersApi.mine).toHaveBeenLastCalledWith(expect.not.objectContaining({ status: expect.anything() }));
    ordersApi.mine.mockResolvedValue({ content: [], number: 0, size: 24, totalElements: 0, totalPages: 0 });
    await userEvent.click(screen.getByRole("tab", { name: "Đã hủy" }));
    expect(router.state.location.search).toBe("?status=cancelled");
    expect(await screen.findByText("Không có đơn đã hủy")).toBeInTheDocument();
    expect(ordersApi.mine).toHaveBeenLastCalledWith(expect.objectContaining({ status: "CANCELLED,EXPIRED", size: 24 }));
    expect(screen.getByRole("link", { name: "Xem tất cả đơn" })).toHaveAttribute("href", "/me/orders");
  });

  it("lib: bộ lọc lạ về Tất cả, ô ngày theo giờ VN", () => {
    expect(orderFilterOf("xyz").value).toBe("all");
    expect(orderFilterOf("pending").status).toBe("PENDING_PAYMENT,MANUAL_REVIEW");
    expect(dateTile("2026-09-20T18:30:00Z")).toEqual({ day: "21", month: "Th9" });
    expect(dateTile(null)).toBeNull();
  });

  it("rỗng → gợi ý khám phá sự kiện", async () => {
    ordersApi.mine.mockResolvedValue({ content: [], number: 0, size: 12, totalElements: 0, totalPages: 0 });
    renderPage(<MyOrdersPage />, "/me/orders");
    expect(await screen.findByText("Chưa có đơn hàng nào")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Khám phá sự kiện" })).toHaveAttribute("href", "/events");
  });

  it("lỗi → thử lại", async () => {
    ordersApi.mine.mockRejectedValueOnce(new ApiError({ status: 500, message: "Máy chủ gặp lỗi." }));
    ordersApi.mine.mockResolvedValue({ content: [order], number: 0, size: 12, totalElements: 1, totalPages: 1 });
    renderPage(<MyOrdersPage />, "/me/orders");
    await userEvent.click(await screen.findByRole("button", { name: "Thử lại" }));
    expect(await screen.findByRole("link", { name: /The Lumière Tour/ })).toBeInTheDocument();
  });
});

describe("ProfilePage", () => {
  it("WRONG_PASSWORD gắn vào ô mật khẩu hiện tại", async () => {
    login(customer);
    authApi.me.mockResolvedValue(customer);
    usersApi.changePassword.mockRejectedValue(
      new ApiError({ status: 400, code: "WRONG_PASSWORD", message: "Sai", errors: [{ field: "currentPassword", message: "Mật khẩu hiện tại không đúng." }] })
    );
    renderPage(<ProfilePage />, "/me/profile");
    await userEvent.type(await screen.findByLabelText("Mật khẩu hiện tại"), "cu123456");
    await userEvent.type(screen.getByLabelText("Mật khẩu mới"), "moi123456");
    await userEvent.type(screen.getByLabelText("Nhập lại mật khẩu mới"), "moi123456");
    await userEvent.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));
    expect(await screen.findByText("Mật khẩu hiện tại không đúng.")).toBeInTheDocument();
    expect(usersApi.changePassword).toHaveBeenCalledWith({ currentPassword: "cu123456", newPassword: "moi123456" }, expect.anything());
  });

  it("lưu thông tin cá nhân cập nhật user trong cache /auth/me", async () => {
    login(customer);
    authApi.me.mockResolvedValue(customer);
    usersApi.updateMe.mockImplementation(async (body) => ({ ...customer, ...body }));
    renderPage(<ProfilePage />, "/me/profile");
    const name = await screen.findByLabelText("Họ và tên");
    // Thanh lưu chỉ hiện khi form có thay đổi.
    expect(screen.queryByRole("button", { name: "Lưu thay đổi" })).not.toBeInTheDocument();
    await userEvent.clear(name);
    await userEvent.type(name, "Lê Thu Hà Nguyễn");
    await userEvent.type(screen.getByLabelText(/Số điện thoại/), "0912847193");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    // Thẻ tóm tắt đọc cache /auth/me (RootLayout đồng bộ cache này sang store).
    expect(await screen.findByRole("heading", { level: 2, name: "Lê Thu Hà Nguyễn" })).toBeInTheDocument();
    expect(authApi.me).toHaveBeenCalledTimes(1);
    expect(usersApi.updateMe).toHaveBeenCalledWith({ fullName: "Lê Thu Hà Nguyễn", phone: "0912847193", bio: null, avatarUrl: null }, expect.anything());
  });

  it("customer thấy CTA trở thành nhà tổ chức", async () => {
    login(customer);
    authApi.me.mockResolvedValue(customer);
    renderPage(<ProfilePage />, "/me/profile");
    expect(await screen.findByRole("link", { name: /Trở thành nhà tổ chức/ })).toHaveAttribute("href", "/become-organizer");
  });
});

describe("AccountLayout", () => {
  const renderLayout = (path) => {
    const router = createMemoryRouter(
      [
        {
          element: <AccountLayout />,
          children: [
            { path: "/me/tickets", element: <p>trang vé</p> },
            { path: "/me/orders", element: <p>trang đơn</p> },
          ],
        },
        { path: "*", element: <p>đích</p> },
      ],
      { initialEntries: [path] }
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    return router;
  };

  it("menu: mục đang mở có aria-current, 'Vé đang bán lại' sáng theo ?scope=listed, khách thấy Trở thành ban tổ chức", async () => {
    login(customer);
    renderLayout("/me/tickets?scope=listed");
    expect(await screen.findByText("trang vé")).toBeInTheDocument();
    const [desktop] = screen.getAllByRole("navigation", { name: "Menu tài khoản" }).filter((n) => n.closest("aside"));
    expect(within(desktop).getByRole("link", { name: "Vé đang bán lại" })).toHaveAttribute("aria-current", "page");
    expect(within(desktop).getByRole("link", { name: "Vé của tôi" })).not.toHaveAttribute("aria-current");
    expect(within(desktop).getByRole("link", { name: "Trở thành ban tổ chức" })).toHaveAttribute("href", "/become-organizer");
    expect(within(desktop).queryByRole("link", { name: "Dashboard BTC" })).toBeNull();
    expect(screen.getByText("a@example.com")).toBeInTheDocument();
  });

  it("organizer thấy Dashboard BTC; Đăng xuất xóa phiên và về trang chủ", async () => {
    login({ ...customer, role: "ORGANIZER" });
    const router = renderLayout("/me/orders");
    const [desktop] = (await screen.findAllByRole("navigation", { name: "Menu tài khoản" })).filter((n) => n.closest("aside"));
    expect(within(desktop).getByRole("link", { name: "Đơn hàng" })).toHaveAttribute("aria-current", "page");
    expect(within(desktop).getByRole("link", { name: "Dashboard BTC" })).toHaveAttribute("href", "/organizer");
    await userEvent.click(within(desktop).getByRole("button", { name: "Đăng xuất" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(useAuthStore.getState().accessToken).toBeFalsy();
  });
});

describe("BecomeOrganizerPage", () => {
  it("organizer bị chuyển về /organizer", async () => {
    login({ ...customer, role: "ORGANIZER" });
    const router = renderPage(<BecomeOrganizerPage />, "/become-organizer");
    await waitFor(() => expect(router.state.location.pathname).toBe("/organizer"));
  });

  it("bắt buộc tên ban tổ chức", async () => {
    login(customer);
    renderPage(<BecomeOrganizerPage />, "/become-organizer");
    await userEvent.click(screen.getByRole("button", { name: "Tạo hồ sơ ban tổ chức" }));
    expect(await screen.findByText("Tên ban tổ chức là bắt buộc")).toBeInTheDocument();
  });
});
