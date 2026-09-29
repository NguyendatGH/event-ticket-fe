// Test trang Vé của tôi.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const calls = [];
const ticket = (over) => ({
  id: "t1",
  ticketCode: "code-1",
  status: "ACTIVE",
  price: 950000,
  tier: { id: "s", name: "Standard" },
  event: { id: "e", slug: "jazz", name: "Saigon Jazz Night", startsAt: "2026-11-05T13:00:00Z", venue: { name: "Nhà hát", city: "TP.HCM" } },
  ...over,
});

vi.mock("@/api", async (orig) => {
  const actual = await orig();
  return {
    flattenPages: actual.flattenPages,
    totalOf: actual.totalOf,
    useMyTickets: (params) => {
      calls.push(params);
      const content = params.scope === "past" ? [] : [ticket(), ticket({ id: "t2", price: 0 })];
      return { isPending: false, isError: false, isSuccess: true, data: { pages: [{ content, number: 0, totalPages: 1, totalElements: content.length }] }, hasNextPage: false };
    },
  };
});

const { default: MyTicketsPage } = await import("./MyTicketsPage");

const renderAt = (path) => {
  const router = createMemoryRouter([{ path: "/me/tickets", element: <MyTicketsPage /> }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
};

describe("MyTicketsPage", () => {
  it("gom vé cùng sự kiện thành một khối; mỗi dòng vé có giá và Xem vé", () => {
    renderAt("/me/tickets");
    const group = screen.getByRole("region", { name: "Saigon Jazz Night" });
    expect(within(group).getAllByText("2 vé").length).toBeGreaterThan(0);
    const rows = within(group).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("950.000đ")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Miễn phí")).toBeInTheDocument();
    expect(within(rows[0]).getByRole("link", { name: "Xem vé" })).toHaveAttribute("href", "/me/tickets/t1");
    expect(within(rows[1]).getByRole("link", { name: "Xem vé" })).toHaveAttribute("href", "/me/tickets/t2");
  });

  it("chỉ có tab Sắp diễn ra / Đã qua; đổi tab ghi scope lên URL và hiện trạng thái rỗng có hành động", async () => {
    const router = renderAt("/me/tickets");
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    await userEvent.click(screen.getByRole("tab", { name: "Đã qua" }));
    expect(router.state.location.search).toBe("?scope=past");
    expect(calls.at(-1)).toEqual({ scope: "past", size: 24 });
    expect(await screen.findByText("Chưa có sự kiện nào đã qua")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Khám phá sự kiện" })).toHaveAttribute("href", "/events");
  });

  it("?scope=listed (tab cũ) rơi về Sắp diễn ra", () => {
    renderAt("/me/tickets?scope=listed");
    expect(calls.at(-1)).toEqual({ scope: "upcoming", size: 24 });
  });
});
