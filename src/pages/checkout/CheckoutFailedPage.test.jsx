// Test trang thanh toán thất bại.

import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

let order = null;
vi.mock("@/api", () => ({
  useOrder: () => ({ data: order, isPending: false, isError: false, refetch: vi.fn() }),
  useEvent: () => ({ data: undefined, isPending: false }),
}));
const { default: CheckoutFailedPage } = await import("./CheckoutFailedPage");

const renderAt = (path) => {
  const router = createMemoryRouter(
    [
      { path: "/checkout/failed", element: <CheckoutFailedPage /> },
      { path: "/checkout/success", element: <p>success</p> },
      { path: "/orders/:id", element: <p>order page</p> },
    ],
    { initialEntries: [path] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

const base = { id: "o1", orderCode: 1000038, eventSlug: "jazz", eventName: "Jazz", items: [], feeAmount: 12000, totalAmount: 12000 };

describe("CheckoutFailedPage", () => {
  it("đơn đã PAID (Back sau khi thanh toán lại) → sang trang thành công, không mời mua lại", async () => {
    order = { ...base, status: "PAID", payment: { status: "PAID" } };
    const router = renderAt("/checkout/failed?order=o1&reason=declined");
    expect(await screen.findByText("success")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/checkout/success");
    expect(router.state.location.search).toBe("?order=o1");
    expect(screen.queryByRole("link", { name: "Thử lại" })).toBeNull();
  });

  it("đơn đang đối soát → trang đơn hàng", async () => {
    order = { ...base, status: "MANUAL_REVIEW", payment: { status: "PAID_LATE" } };
    const router = renderAt("/checkout/failed?order=o1&reason=declined");
    expect(await screen.findByText("order page")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/orders/o1");
  });

  it("đơn bị từ chối còn giữ chỗ → Thanh toán lại trên cùng link", () => {
    order = { ...base, status: "PENDING_PAYMENT", expiresAt: "2026-09-27T10:00:00Z", payment: { status: "FAILED", checkoutUrl: "https://gw/pay/o1" } };
    renderAt("/checkout/failed?order=o1&reason=declined");
    expect(screen.getByRole("heading", { name: "Thanh toán không thành công" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thanh toán lại" })).toHaveAttribute("href", "https://gw/pay/o1");
  });

  it("đơn hết hạn → Thử lại với đúng giỏ cũ", () => {
    order = { ...base, status: "EXPIRED", items: [{ tierId: "t1", tierName: "GA", quantity: 2, unitPrice: 100 }], payment: { status: "EXPIRED" } };
    renderAt("/checkout/failed?order=o1");
    expect(screen.getByText("Giao dịch đã hết thời gian.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thử lại" })).toHaveAttribute("href", "/checkout/jazz?tiers=t1:2");
  });
});
