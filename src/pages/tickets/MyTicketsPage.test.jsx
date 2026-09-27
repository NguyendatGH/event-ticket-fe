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
  listing: null,
  resellable: true,
  ...over,
});

vi.mock("@/api", async (orig) => {
  const actual = await orig();
  return {
    flattenPages: actual.flattenPages,
    totalOf: actual.totalOf,
    useMyTickets: (params) => {
      calls.push(params);
      const content =
        params.scope === "listed"
          ? []
          : [ticket(), ticket({ id: "t2", resellable: false, listing: { id: "l9", price: 1100000, status: "ACTIVE" } })];
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
  it("gom vé cùng sự kiện thành một khối; dòng vé có Xem vé, Bán lại khi resellable, Xem tin bán khi đang rao", () => {
    renderAt("/me/tickets");
    const group = screen.getByRole("region", { name: "Saigon Jazz Night" });
    expect(within(group).getAllByText("2 vé").length).toBeGreaterThan(0);
    const rows = within(group).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByRole("link", { name: "Bán lại" })).toHaveAttribute("href", "/me/tickets/t1/resell");
    expect(within(rows[1]).getByRole("link", { name: "Xem tin bán" })).toHaveAttribute("href", "/resale/l9");
    expect(within(rows[1]).queryByRole("link", { name: "Bán lại" })).toBeNull();
    expect(within(rows[0]).getByRole("link", { name: "Xem vé" })).toHaveAttribute("href", "/me/tickets/t1");
  });

  it("đổi tab ghi scope lên URL và hiện trạng thái rỗng có hành động", async () => {
    const router = renderAt("/me/tickets");
    await userEvent.click(screen.getByRole("tab", { name: "Đang bán lại" }));
    expect(router.state.location.search).toBe("?scope=listed");
    expect(calls.at(-1)).toEqual({ scope: "listed", size: 24 });
    expect(await screen.findByText("Bạn chưa đăng bán lại vé nào")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem vé sắp diễn ra" })).toHaveAttribute("href", "/me/tickets");
  });
});
