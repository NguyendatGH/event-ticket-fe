import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { routes } from "./router";
import { createQueryClient } from "./queryClient";
import { useAuthStore } from "@/stores/auth";

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
};

describe("router", () => {
  it("trang chủ có header + stub", async () => {
    renderAt("/");
    // Trang chủ lazy-load nhiều module (carousel, section…): khi cả bộ test chạy song song, lần import đầu có thể > 1s.
    expect(await screen.findByRole("heading", { level: 1, name: "Trang chủ" }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Danh mục sự kiện" })).toBeInTheDocument();
  });

  it("trang cần đăng nhập → /auth/login với state.from", async () => {
    const router = renderAt("/me/tickets?scope=past");
    expect(await screen.findByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/auth/login");
    expect(router.state.location.state).toEqual({ from: "/me/tickets?scope=past" });
  });

  it("customer vào khu organizer → /become-organizer", async () => {
    useAuthStore.setState({ accessToken: "t", refreshToken: "r", expiresAt: Date.now() + 600_000, user: { id: "u", role: "CUSTOMER", fullName: "Lê Thu Hà" } });
    const router = renderAt("/organizer/events");
    expect(await screen.findByRole("heading", { level: 1, name: "Trở thành nhà tổ chức" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/become-organizer");
    useAuthStore.getState().clear();
  });

  it("organizer vào dashboard có sidebar", async () => {
    useAuthStore.setState({
      accessToken: "t",
      refreshToken: "r",
      expiresAt: Date.now() + 600_000,
      user: { id: "u", role: "ORGANIZER", fullName: "Trần Quốc Bảo", organizer: { slug: "sunrise-live", name: "Sunrise Live" } },
    });
    renderAt("/organizer");
    expect(await screen.findByRole("heading", { level: 1, name: "Tổng quan" })).toBeInTheDocument();
    expect(screen.getAllByText("Sunrise Live").length).toBeGreaterThan(0);
    useAuthStore.getState().clear();
  });

  it("/checkout/cancel?orderId= chuyển về trang đơn", async () => {
    const router = renderAt("/checkout/cancel?orderId=abc");
    expect(await screen.findByRole("heading", { level: 1, name: "Chi tiết đơn hàng" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/orders/abc");
  });

  it("route lạ → NotFound", async () => {
    renderAt("/khong-co-trang-nay");
    expect(await screen.findByRole("heading", { level: 1, name: "Không tìm thấy trang" })).toBeInTheDocument();
  });
});
