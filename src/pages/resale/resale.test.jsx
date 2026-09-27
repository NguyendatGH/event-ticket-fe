import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/auth";

const buyMutate = vi.fn();
const createMutate = vi.fn();
const listingParams = vi.fn();
vi.mock("@/api", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useBuyResale: () => ({ mutate: buyMutate, isPending: false, isSuccess: false }),
    useCreateListing: () => ({ mutate: createMutate, isPending: false }),
    useMyTickets: () => ({ data: undefined }),
    useResaleListings: (params) => {
      listingParams(params);
      return { isPending: true, data: undefined };
    },
    useEventFacets: () => ({ data: undefined }),
    useEvent: () => ({ data: undefined }),
  };
});

const { BuyPanel } = await import("./components/BuyPanel");
const { PriceForm } = await import("./components/PriceForm");
const { default: MarketplacePage } = await import("./MarketplacePage");

const listing = {
  id: "l1", status: "ACTIVE", price: 1250000, originalPrice: 1500000, tier: { id: "t", name: "GA Standing" },
  event: { id: "e", slug: "lumiere", name: "The Lumière Tour" }, seller: { displayName: "Nguyen A." }, verified: true, mine: false,
};

const wrap = (ui) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/resale/l1"]}>
        <Routes>
          <Route path="/resale/:id" element={ui} />
          <Route path="/auth/login" element={<p>login page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  buyMutate.mockReset();
  useAuthStore.getState().clear();
});

describe("BuyPanel", () => {
  it("khách chưa đăng nhập thấy CTA đăng nhập", () => {
    wrap(<BuyPanel listing={listing} />);
    expect(screen.getByRole("link", { name: /Đăng nhập để mua/ })).toHaveAttribute("href", "/auth/login");
    expect(screen.queryByRole("button", { name: "Mua vé" })).toBeNull();
  });

  it("vé đã bán: nút bị khóa kèm giải thích", () => {
    useAuthStore.setState({ accessToken: "t", user: { id: "u", fullName: "A" } });
    wrap(<BuyPanel listing={{ ...listing, status: "SOLD" }} />);
    expect(screen.getByText("Vé đã được bán")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Không thể mua" })).toBeDisabled();
  });

  it("mua: mỗi lần bấm một Idempotency-Key mới, chuyển tới checkoutUrl", async () => {
    useAuthStore.setState({ accessToken: "t", user: { id: "u", fullName: "A", phone: "0912345678" } });
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    wrap(<BuyPanel listing={listing} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Mua vé" }));
    await user.click(screen.getByRole("button", { name: "Mua vé" }));
    await waitFor(() => expect(buyMutate).toHaveBeenCalledTimes(2));
    const [a, b] = buyMutate.mock.calls.map((c) => c[0]);
    expect(a).toMatchObject({ id: "l1", phone: "0912345678" });
    expect(a.idempotencyKey).not.toBe(b.idempotencyKey);
    buyMutate.mock.calls[0][1].onSuccess({ id: "o1", payment: { checkoutUrl: "http://gw/checkout/o1" } });
    expect(assign).toHaveBeenCalledWith("http://gw/checkout/o1");
    expect(sessionStorage.getItem("nhip.pendingOrder")).toBe("o1");
    vi.unstubAllGlobals();
  });

  it("số điện thoại sai → lỗi, không gọi API", async () => {
    useAuthStore.setState({ accessToken: "t", user: { id: "u", fullName: "A" } });
    wrap(<BuyPanel listing={listing} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Số điện thoại/), "abc");
    await user.click(screen.getByRole("button", { name: "Mua vé" }));
    expect(await screen.findByText("Số điện thoại không hợp lệ")).toBeInTheDocument();
    expect(buyMutate).not.toHaveBeenCalled();
  });
});

describe("PriceForm", () => {
  it("vượt giá trần → báo lỗi; giá hợp lệ → gửi số nguyên và cập nhật bảng tính", async () => {
    const onSubmit = vi.fn();
    wrap(<PriceForm original={1500000} max={1800000} submitLabel="Đăng bán" onSubmit={onSubmit} />);
    const user = userEvent.setup();
    const input = screen.getByLabelText("Giá bán");
    await user.type(input, "2500000");
    await user.click(screen.getByRole("button", { name: "Đăng bán" }));
    expect(await screen.findByText("Giá bán tối đa 1.800.000đ (giá trần)")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "1350000");
    expect(input).toHaveValue("1.350.000");
    expect(screen.getByText("-10%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Đăng bán" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toBe(1350000);
  });

  it("nút Giá trần điền nhanh giá tối đa", async () => {
    wrap(<PriceForm original={1500000} max={1800000} submitLabel="Đăng bán" onSubmit={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole("button", { name: /Giá trần/ }));
    expect(screen.getByLabelText("Giá bán")).toHaveValue("1.800.000");
  });
});

describe("MarketplacePage", () => {
  it("bỏ qua sort và eventId không hợp lệ trên URL (không gửi lên BE)", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/resale?sort=-date&eventId=abc&city=Hà Nội"]}>
          <MarketplacePage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(listingParams).toHaveBeenLastCalledWith(expect.objectContaining({ sort: "newest", eventId: "", city: "Hà Nội" }));
  });
});
