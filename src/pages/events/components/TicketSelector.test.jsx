// Test khối chọn hạng vé và tổng tiền.

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/api", async (orig) => ({
  ...(await orig()),
  useAppConfig: () => ({ checkoutFee: 12000 }),
}));
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TicketSelector } from "./TicketSelector";

const event = {
  id: "e1",
  slug: "the-lumiere-tour",
  status: "PUBLISHED",
  priceFrom: 800000,
  tiers: [
    {
      id: "vip",
      name: "VIP",
      description: "Vị trí đẹp nhất",
      price: 2500000,
      available: 2,
      maxPerOrder: 4,
    },
    {
      id: "ga",
      name: "GA",
      description: "Khu trung tâm",
      price: 800000,
      available: 300,
      maxPerOrder: 6,
    },
    {
      id: "gone",
      name: "Early",
      description: null,
      price: 500000,
      available: 0,
      maxPerOrder: 4,
    },
  ],
};

function setup(ev = event) {
  const router = createMemoryRouter(
    [
      {
        path: "/events/:slug",
        element: <TicketSelector event={ev} />,
      },
      { path: "/checkout/:slug", element: <p>checkout</p> },
    ],
    { initialEntries: [`/events/${ev.slug}`] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("TicketSelector", () => {
  it("giới hạn số lượng theo min(available, maxPerOrder), khóa hạng hết vé", async () => {
    const user = userEvent.setup();
    setup();
    const plusVip = screen.getByRole("button", { name: "Thêm một vé VIP" });
    await user.click(plusVip);
    await user.click(plusVip);
    expect(plusVip).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Thêm một vé Early" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hết vé")).toBeInTheDocument();
  });

  it("tính tổng có phí dịch vụ và chuyển tới checkout với tiers=id:qty", async () => {
    const user = userEvent.setup();
    const router = setup();
    const cta = screen.getByRole("button", { name: "Chọn số lượng vé" });
    expect(cta).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Thêm một vé VIP" }));
    await user.click(screen.getByRole("button", { name: "Thêm một vé GA" }));
    await user.click(screen.getByRole("button", { name: "Thêm một vé GA" }));
    expect(screen.getByText("Phí dịch vụ").nextSibling).toHaveTextContent(
      "12.000đ",
    );
    expect(screen.getByText("4.112.000đ")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Mua 3 vé/ }));
    expect(router.state.location.pathname).toBe("/checkout/the-lumiere-tour");
    expect(router.state.location.search).toBe("?tiers=vip:1,ga:2");
  });

  it("sự kiện sắp mở bán: không có bộ chọn, nút bị khóa", () => {
    setup({ ...event, status: "UPCOMING" });
    expect(
      screen.queryByRole("button", { name: /Thêm một vé/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sắp mở bán" })).toBeDisabled();
  });
});
