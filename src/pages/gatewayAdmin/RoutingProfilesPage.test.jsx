
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { addRule, state } = vi.hoisted(() => ({ addRule: vi.fn(), state: { routes: {}, acquirers: [] } }));

vi.mock("@/api", () => ({
  useGatewayRoutingProfiles: () => ({ data: [{ code: "STANDARD", name: "Thẻ + QR", status: "ACTIVE" }], isPending: false, isError: false }),
  useGatewayRoutingProfileDetails: () => [{ isPending: false, data: { code: "STANDARD", routes: state.routes } }],
  useGatewayRoutingProfile: () => ({ isPending: false, data: { code: "STANDARD", routes: state.routes } }),
  useGatewayAcquirers: () => ({ data: state.acquirers }),
  useAddRoutingRule: () => ({ mutate: addRule, isPending: false }),
  useCreateRoutingProfile: () => ({ mutate: vi.fn(), isPending: false }),
}));

const { default: RoutingProfilesPage } = await import("./RoutingProfilesPage");

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

async function openProfile() {
  render(<RoutingProfilesPage />);
  await userEvent.click(screen.getByRole("button", { name: /STANDARD/ }));
}

describe("RoutingProfilesPage", () => {
  beforeEach(() => {
    addRule.mockReset();
    state.routes = { CARD: [{ priority: 1, acquirerCode: "bank-a" }, { priority: 2, acquirerCode: "bank-b" }] };
    state.acquirers = [
      { code: "bank-a", name: "Bank A", status: "ACTIVE", paymentMethods: ["CARD", "GOOGLE_PAY"] },
      { code: "bank-b", name: "Bank B", status: "ACTIVE", paymentMethods: ["CARD"] },
      { code: "QR_A", name: "QR A", status: "ACTIVE", paymentMethods: ["QR"] },
      { code: "off", name: "Tắt", status: "INACTIVE", paymentMethods: ["GOOGLE_PAY"] },
    ];
  });

  it("tiêu đề profile tóm tắt method đã có route", () => {
    render(<RoutingProfilesPage />);
    expect(screen.getByText("route: Thẻ")).toBeInTheDocument();
  });

  it("mở profile: đủ 5 phương thức, method chưa có rule nói rõ là chưa nhận được", async () => {
    await openProfile();

    for (const label of ["Thẻ", "QR", "PayNow", "Google Pay", "Apple Pay"])
      expect(screen.getByText(label, { selector: "span.font-medium" })).toBeInTheDocument();
    expect(screen.getAllByText(/Chưa có rule — terminal dùng profile này không nhận được/)).toHaveLength(4);
    expect(screen.getByText("bank-a")).toBeInTheDocument();
    expect(screen.getByText("bank-b")).toBeInTheDocument();
  });

  it("thêm Google Pay: chỉ liệt kê acquirer đang bật và nhận Google Pay, ưu tiên tự gán là 1", async () => {
    await openProfile();

    await userEvent.click(screen.getByRole("combobox", { name: "Thêm acquirer cho Google Pay của STANDARD" }));
    expect(await screen.findByRole("option", { name: /bank-a/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /bank-b/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /off/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: /bank-a/ }));

    const form = screen.getByRole("combobox", { name: "Thêm acquirer cho Google Pay của STANDARD" }).closest("form");
    await userEvent.click(form.querySelector("button[type=submit]"));

    expect(addRule).toHaveBeenCalledWith({ code: "STANDARD", paymentMethod: "GOOGLE_PAY", acquirerCode: "bank-a", priority: 1 });
  });

  it("thêm vào method đã có chuỗi thì ưu tiên là số kế tiếp, không cho chọn lại acquirer đã có", async () => {
    state.acquirers = [...state.acquirers, { code: "bank-c", name: "Bank C", status: "ACTIVE", paymentMethods: ["CARD"] }];
    await openProfile();

    await userEvent.click(screen.getByRole("combobox", { name: "Thêm acquirer cho Thẻ của STANDARD" }));
    expect(screen.queryByRole("option", { name: /bank-a/ })).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole("option", { name: /bank-c/ }));
    const form = screen.getByRole("combobox", { name: "Thêm acquirer cho Thẻ của STANDARD" }).closest("form");
    await userEvent.click(form.querySelector("button[type=submit]"));

    expect(addRule).toHaveBeenCalledWith({ code: "STANDARD", paymentMethod: "CARD", acquirerCode: "bank-c", priority: 3 });
  });

  it("acquirer trong chuỗi bị tắt thì báo ngay trên dòng", async () => {
    state.routes = { GOOGLE_PAY: [{ priority: 1, acquirerCode: "off" }] };
    await openProfile();

    expect(screen.getByText("(đang tắt)")).toBeInTheDocument();
  });
});
