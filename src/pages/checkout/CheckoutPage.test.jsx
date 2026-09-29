// Test trang thanh toán: điền sẵn, body gửi lên, Idempotency-Key, chuyển sang cổng.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/auth";

const mutate = vi.fn();
let keyN = 0;
const event = {
  id: "e1",
  slug: "lumiere",
  name: "The Lumière Tour",
  status: "PUBLISHED",
  startsAt: "2026-10-24T12:00:00Z",
  endsAt: "2026-10-24T15:00:00Z",
  venue: { name: "Mỹ Đình", city: "Hà Nội" },
  tiers: [
    { id: "vip", name: "VIP", price: 2500000, available: 3, maxPerOrder: 4 },
    { id: "ga", name: "GA", price: 800000, available: 0, maxPerOrder: 6 },
  ],
};

vi.mock("@/api", () => ({
  useEvent: () => ({ isPending: false, isError: false, data: event, refetch: vi.fn() }),
  useCreateOrder: () => ({ mutate, isPending: false }),
  newIdempotencyKey: () => `key-${++keyN}`,
  useAppConfig: () => ({ checkoutFee: 12000 }),
}));

const gateway = vi.fn();
vi.mock("@/lib/checkout", async (orig) => ({ ...(await orig()), goToGateway: (url) => gateway(url) }));

const { default: CheckoutPage } = await import("./CheckoutPage");

function renderAt(path) {
  const router = createMemoryRouter(
    [
      { path: "/checkout/:slug", element: <CheckoutPage /> },
      { path: "/orders/:id", element: <p>order page</p> },
    ],
    { initialEntries: [path] }
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    mutate.mockReset();
    gateway.mockReset();
    useAuthStore.getState().clear();
  });

  it("form thiếu/sai: báo lỗi, không gửi đơn", async () => {
    renderAt("/checkout/lumiere?tiers=vip:2");
    await userEvent.type(screen.getByLabelText("Email"), "abc");
    await userEvent.click(screen.getByRole("button", { name: /Thanh toán/ }));
    expect(await screen.findByText("Họ và tên là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("số lượng kẹp theo tồn kho, nút + tăng và lưu vào URL", async () => {
    const router = renderAt("/checkout/lumiere?tiers=vip:9,ga:2");
    expect(screen.getByTestId("order-total")).toHaveTextContent("7.512.000đ");
    await userEvent.click(screen.getByRole("button", { name: "Bớt một vé VIP" }));
    expect(router.state.location.search).toBe("?tiers=vip%3A2");
    expect(screen.getByRole("button", { name: "Thêm một vé VIP" })).toBeEnabled();
  });

  it("đã đăng nhập: điền sẵn, gửi đúng body, mỗi lần bấm một Idempotency-Key, chuyển sang cổng", async () => {
    useAuthStore.setState({ accessToken: "t", refreshToken: "r", expiresAt: Date.now() + 60_000, user: { fullName: "Lê Thu Hà", email: "ha@example.com", phone: "" } });
    renderAt("/checkout/lumiere?tiers=vip:1");
    expect(screen.getByLabelText("Họ và tên")).toHaveValue("Lê Thu Hà");

    const pay = screen.getByRole("button", { name: /Thanh toán/ });
    await userEvent.click(pay);
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    const [vars, handlers] = mutate.mock.calls[0];
    expect(vars.body).toEqual({
      eventId: "e1",
      items: [{ tierId: "vip", quantity: 1 }],
      customer: { name: "Lê Thu Hà", email: "ha@example.com", phone: null },
    });

    await userEvent.click(pay);
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(2));
    expect(mutate.mock.calls[1][0].idempotencyKey).not.toBe(vars.idempotencyKey);

    handlers.onSuccess({ id: "o1", payment: { checkoutUrl: "http://gw/pay/o1" } });
    expect(gateway).toHaveBeenCalledWith("http://gw/pay/o1");
    expect(sessionStorage.getItem("nhip.pendingOrder")).toBe("o1");
  });

  it("lỗi TIER_SOLD_OUT hiện cạnh tóm tắt đơn", async () => {
    useAuthStore.setState({ accessToken: "t", refreshToken: "r", expiresAt: Date.now() + 60_000, user: { fullName: "Hà", email: "ha@example.com" } });
    renderAt("/checkout/lumiere?tiers=vip:1");
    await userEvent.click(screen.getByRole("button", { name: /Thanh toán/ }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const { act } = await import("react");
    act(() => mutate.mock.calls[0][1].onError({ code: "TIER_SOLD_OUT", message: "Hạng vé VIP không đủ số lượng (còn 0)" }));
    expect(await screen.findByText("Hạng vé VIP không đủ số lượng (còn 0)")).toBeInTheDocument();
  });
});
