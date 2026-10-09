import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { add } = vi.hoisted(() => ({ add: vi.fn() }));

vi.mock("@/api", () => ({
  useGatewayAcquirers: () => ({ data: [
    { code: "test-acquirer", name: "mock bank d", paymentMethods: ["CARD", "GOOGLE_PAY"] },
  ] }),
  useAddGatewayAcquirerConfig: () => ({ mutate: add, isPending: false }),
}));

const { AddAcquirerForm } = await import("./AddAcquirerForm");

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

const terminals = [
  { terminalId: "TerNo000012", name: "Web" },
  { terminalId: "TerNo000013", name: "POS quầy" },
];

async function chooseAcquirer() {
  await userEvent.click(screen.getByRole("combobox", { name: "Acquirer" }));
  await userEvent.click(await screen.findByRole("option", { name: /test-acquirer/ }));
}

describe("AddAcquirerForm", () => {
  beforeEach(() => add.mockReset());

  it("mặc định MID là merchant no, TID là terminal đầu tiên của merchant: chọn acquirer là nối được", async () => {
    render(<AddAcquirerForm merNo="MerNo000012" terminals={terminals} />);

    expect(screen.getByRole("button", { name: "Add Acquirer Connection" })).toBeDisabled();
    await chooseAcquirer();
    await userEvent.click(screen.getByRole("button", { name: "Add Acquirer Connection" }));

    expect(add).toHaveBeenCalledWith({
      merNo: "MerNo000012", acquirerCode: "test-acquirer", mid: "MerNo000012", tid: "TerNo000012",
    });
  });

  it("TID liệt kê terminal của merchant này và cho đổi sang terminal khác", async () => {
    render(<AddAcquirerForm merNo="MerNo000012" terminals={terminals} />);
    await chooseAcquirer();

    await userEvent.click(screen.getByRole("combobox", { name: "Acquirer Terminal ID (TID)" }));
    expect(await screen.findByRole("option", { name: "TerNo000012 · Web" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "TerNo000013 · POS quầy" }));
    await userEvent.click(screen.getByRole("button", { name: "Add Acquirer Connection" }));

    expect(add.mock.calls[0][0]).toMatchObject({ tid: "TerNo000013" });
  });

  it("acquirer cấp mã riêng thì chọn Nhập tay… và gõ vào ô hiện ra", async () => {
    render(<AddAcquirerForm merNo="MerNo000012" terminals={terminals} />);
    await chooseAcquirer();

    await userEvent.click(screen.getByRole("combobox", { name: "Acquirer Merchant ID (MID)" }));
    await userEvent.click(await screen.findByRole("option", { name: "Nhập tay…" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Acquirer Merchant ID (MID) (nhập tay)" }), "MID-THAT-001");
    await userEvent.click(screen.getByRole("button", { name: "Add Acquirer Connection" }));

    expect(add.mock.calls[0][0]).toMatchObject({ mid: "MID-THAT-001", tid: "TerNo000012" });
  });
});
