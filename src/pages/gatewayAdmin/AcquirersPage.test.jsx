
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { update, state } = vi.hoisted(() => ({ update: vi.fn(), state: { acquirers: [] } }));

vi.mock("@/api", () => ({
  useGatewayAcquirers: () => ({ data: state.acquirers, isPending: false, isError: false }),
  useGatewayRoutingProfiles: () => ({ data: [{ code: "STANDARD" }] }),
  useGatewayRoutingProfileDetails: () => [{ isPending: false, data: { code: "STANDARD", routes: {
    CARD: [{ priority: 1, acquirerCode: "bank-a" }], GOOGLE_PAY: [{ priority: 1, acquirerCode: "bank-a" }] } } }],
  useUpdateGatewayAcquirer: () => ({ mutate: update, isPending: false }),
  useCreateGatewayAcquirer: () => ({ mutate: vi.fn(), isPending: false }),
}));

const { default: AcquirersPage } = await import("./AcquirersPage");

describe("AcquirersPage", () => {
  beforeEach(() => {
    update.mockReset();
    state.acquirers = [
      { code: "bank-a", name: "Mock Bank A", status: "ACTIVE", paymentMethods: ["CARD", "GOOGLE_PAY"], threeDsSupported: true, bankBin: null },
      { code: "VTB", name: "VietinBank", status: "ACTIVE", paymentMethods: ["CARD", "QR"], threeDsSupported: false, bankBin: "970415" },
    ];
  });

  it("một bảng cho mọi acquirer, mỗi ô tick đúng method acquirer đó nhận", () => {
    render(<AcquirersPage />);

    expect(screen.getByRole("checkbox", { name: "bank-a nhận Google Pay" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "VTB nhận Google Pay" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "VTB nhận QR" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "bank-a có 3DS" })).toBeChecked();
  });

  it("cột Đang dùng ở: acquirer nằm trong profile nào, acquirer chưa route thì nói rõ", () => {
    render(<AcquirersPage />);

    expect(screen.getByText("STANDARD")).toBeInTheDocument();
    expect(screen.getByText("· Thẻ, Google Pay")).toBeInTheDocument();
    expect(screen.getByText("chỉ BTC chọn trực tiếp")).toBeInTheDocument();
  });

  it("tick Google Pay cho VTB rồi Lưu: gửi đủ methods, 3DS và BIN của acquirer đó", async () => {
    render(<AcquirersPage />);

    await userEvent.click(screen.getByRole("checkbox", { name: "VTB nhận Google Pay" }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toEqual({
      code: "VTB", paymentMethods: ["CARD", "QR", "GOOGLE_PAY"], threeDsSupported: false, bankBin: "970415",
    });
  });

  it("chưa sửa gì thì không có nút Lưu; bỏ hết method thì chặn Lưu", async () => {
    render(<AcquirersPage />);
    expect(screen.queryByRole("button", { name: "Lưu" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: "VTB nhận Thẻ" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "VTB nhận QR" }));
    expect(screen.getByRole("button", { name: "Lưu" })).toBeDisabled();
    expect(screen.getByText("Chọn ít nhất một phương thức.")).toBeInTheDocument();
  });

  it("bỏ CARD thì ô 3DS bị khoá", async () => {
    render(<AcquirersPage />);
    await userEvent.click(screen.getByRole("checkbox", { name: "bank-a nhận Thẻ" }));
    expect(screen.getByRole("checkbox", { name: "bank-a có 3DS" })).toBeDisabled();
  });

  it("BIN sai độ dài thì báo và chặn Lưu", async () => {
    render(<AcquirersPage />);
    const row = screen.getByRole("textbox", { name: "BIN của VTB" });
    await userEvent.clear(row);
    await userEvent.type(row, "9704");

    expect(screen.getByText("BIN phải đủ 6 chữ số (hoặc để trống).")).toBeInTheDocument();
    expect(within(document.body).getByRole("button", { name: "Lưu" })).toBeDisabled();
  });
});
