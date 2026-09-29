// Test trang chờ kết quả thanh toán.

import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

let order = null;
vi.mock("@/api", () => ({ useOrder: () => ({ data: order, isError: false, refetch: vi.fn() }) }));
const { default: CheckoutReturnPage } = await import("./CheckoutReturnPage");

const renderAt = (path) => {
  const router = createMemoryRouter(
    [
      { path: "/checkout/return", element: <CheckoutReturnPage /> },
      { path: "/checkout/success", element: <p>success</p> },
      { path: "/checkout/failed", element: <p>failed</p> },
    ],
    { initialEntries: [path] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe("CheckoutReturnPage", () => {
  beforeEach(() => sessionStorage.clear());

  it("PAID → success, xóa pending order", async () => {
    sessionStorage.setItem("nhip.pendingOrder", "o1");
    order = { id: "o1", status: "PAID" };
    const router = renderAt("/checkout/return?orderId=o1");
    expect(await screen.findByText("success")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?order=o1");
    expect(sessionStorage.getItem("nhip.pendingOrder")).toBeNull();
  });

  it("thanh toán FAILED → failed với reason=declined; id lấy từ sessionStorage", async () => {
    sessionStorage.setItem("nhip.pendingOrder", "o2");
    order = { id: "o2", status: "PENDING_PAYMENT", payment: { status: "FAILED" } };
    const router = renderAt("/checkout/return");
    expect(await screen.findByText("failed")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?order=o2&reason=declined");
  });

  it("MANUAL_REVIEW → giải thích tại chỗ, không chuyển trang", async () => {
    order = { id: "o3", orderCode: 99, status: "MANUAL_REVIEW" };
    renderAt("/checkout/return?orderId=o3");
    expect(await screen.findByRole("heading", { name: "Thanh toán đang được đối soát" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem đơn hàng" })).toHaveAttribute("href", "/orders/o3");
  });
});
