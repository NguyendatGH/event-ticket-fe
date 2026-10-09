// Hai chế độ. Cổng BankSim (account.channels có giá trị): BTC mở nhiều kênh nhận tiền, mỗi kênh một ngân hàng + phương
// thức + tài khoản ở ngân hàng đó. Cổng khác (channels = null): BTC chỉ khai tài khoản nhận tiền, không có gì về phương thức.
// BTC là merchant từ lúc đăng ký: nhận thanh toán được cả khi chưa khai tài khoản (tiền được giữ lại).

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mutate, add, update, remove, state } = vi.hoisted(() => ({
  mutate: vi.fn(), add: vi.fn(), update: vi.fn(), remove: vi.fn(), state: { account: null },
}));

vi.mock("@/api", () => ({
  useAppConfig: () => ({ banks: [{ bin: "970422", name: "MB Bank" }, { bin: "970436", name: "Vietcombank" }] }),
  useOrganizerPayoutAccount: () => ({ isPending: false, isError: false, data: state.account }),
  useSaveOrganizerPayoutAccount: () => ({ mutate, isPending: false }),
  useAddPaymentChannel: () => ({ mutate: add, isPending: false }),
  useUpdatePaymentChannel: () => ({ mutate: update, isPending: false }),
  useRemovePaymentChannel: () => ({ mutate: remove, isPending: false }),
}));

const { default: PayoutAccountPage } = await import("./PayoutAccountPage");

// Select của Radix cần mấy API mà jsdom không có.
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

const EMPTY = { bankBin: null, bankName: null, accountName: null, maskedAccountNumber: null, updatedAt: null,
  acceptingPayments: true, payoutSynced: false };
const SAVED = { bankBin: "970422", bankName: "MB Bank", accountName: "NGUYEN VAN A", maskedAccountNumber: "******6789",
  updatedAt: "2026-10-07T10:00:00Z", acceptingPayments: true, payoutSynced: true };

describe("PayoutAccountPage", () => {
  beforeEach(() => {
    mutate.mockReset();
    state.account = EMPTY;
  });

  it("chưa khai tài khoản vẫn đang nhận thanh toán, báo tiền đang được giữ", () => {
    render(<PayoutAccountPage />);

    expect(screen.getByText("Đang nhận thanh toán — tiền đang được giữ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lưu tài khoản" })).toBeDisabled();
  });

  it("cổng chưa mở xong tài khoản người bán thì báo đang kết nối", () => {
    state.account = { ...EMPTY, acceptingPayments: false };
    render(<PayoutAccountPage />);

    expect(screen.getByText("Đang kết nối với cổng thanh toán")).toBeInTheDocument();
  });

  it("cổng không cho chọn ngân hàng (PayOS): không hỏi BTC gì về phương thức", () => {
    render(<PayoutAccountPage />);

    expect(screen.queryByText(/BankSim|PayOS|terminal|Phương thức thanh toán/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("tài khoản đã lên cổng thì báo doanh thu về đâu, chỉ hiện số đã che", () => {
    state.account = SAVED;
    render(<PayoutAccountPage />);

    expect(screen.getByText("Đang nhận thanh toán")).toBeInTheDocument();
    expect(screen.getByText(/Doanh thu về MB Bank .*\*\*\*\*\*\*6789/)).toBeInTheDocument();
  });

  it("tài khoản mới chưa lên cổng thì báo đang cập nhật", () => {
    state.account = { ...SAVED, payoutSynced: false };
    render(<PayoutAccountPage />);

    expect(screen.getByText(/Đang cập nhật với cổng thanh toán/)).toBeInTheDocument();
  });

  it("đổi tài khoản: gõ lại số rồi lưu thì gửi đúng ngân hàng, tên và số (bỏ khoảng trắng)", async () => {
    state.account = SAVED;
    render(<PayoutAccountPage />);

    await userEvent.type(screen.getByLabelText("Số tài khoản"), "0123 456 789");
    await userEvent.click(screen.getByRole("button", { name: "Lưu tài khoản" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({ bankBin: "970422", accountName: "NGUYEN VAN A", accountNumber: "0123456789" });
  });
});

const BANKS = [
  { code: "MBB", name: "MB Bank", bankBin: "970422", paymentMethods: ["QR"], threeDsSupported: false },
  { code: "VCB", name: "Vietcombank", bankBin: "970436", paymentMethods: ["CARD", "QR"], threeDsSupported: true },
  { code: "VTB", name: "VietinBank", bankBin: "970415", paymentMethods: ["CARD", "QR", "PAYNOW"], threeDsSupported: false },
  { code: "TCB", name: "Techcombank", bankBin: "970407", paymentMethods: ["CARD", "QR", "GOOGLE_PAY", "APPLE_PAY"], threeDsSupported: true },
];
const VCB_CHANNEL = { id: "c-vcb", bankCode: "VCB", bankName: "Vietcombank", bankBin: "970436", paymentMethods: ["QR"],
  routableMethods: ["QR"], accountName: "NGUYEN VAN A", maskedAccountNumber: "******6789", primary: true };
const TCB_CHANNEL = { id: "c-tcb", bankCode: "TCB", bankName: "Techcombank", bankBin: "970407", paymentMethods: ["CARD", "GOOGLE_PAY"],
  routableMethods: ["CARD", "GOOGLE_PAY"], accountName: "NGUYEN VAN A", maskedAccountNumber: "******4234", primary: false };
const NO_CHANNEL = { ...EMPTY, paymentMethods: ["CARD", "QR"], banks: BANKS, channels: [] };
const withChannels = (...channels) => ({ ...SAVED, bankBin: "970436", bankName: "Vietcombank", banks: BANKS, channels,
  paymentMethods: channels.flatMap((c) => c.routableMethods) });

async function pickBank(name) {
  await userEvent.click(screen.getByRole("combobox", { name: "Ngân hàng" }));
  // Tên option có kèm chú thích "· bank profile A/B", nên khớp theo phần đầu.
  await userEvent.click(await screen.findByRole("option", { name: new RegExp(`^${name} ·`) }));
}

describe("PayoutAccountPage — kênh nhận tiền (cổng BankSim)", () => {
  beforeEach(() => {
    for (const fn of [add, update, remove]) fn.mockReset();
    state.account = NO_CHANNEL;
  });

  it("chưa có kênh: mở sẵn form, chọn ngân hàng thì bật sẵn mọi phương thức ngân hàng đó hỗ trợ", async () => {
    render(<PayoutAccountPage />);

    expect(screen.getByText("Mở kênh nhận tiền")).toBeInTheDocument();
    await pickBank("Techcombank");

    for (const label of ["Thẻ ngân hàng", "QR / VietQR", "Google Pay", "Apple Pay"])
      expect(screen.getByRole("checkbox", { name: label })).toBeChecked();
    expect(screen.queryByRole("checkbox", { name: "PayNow" })).not.toBeInTheDocument();
  });

  it("mỗi ngân hàng ghi chú kiểu mock bank theo cờ 3DS: có 3DS = profile A, không = profile B, không thẻ = chỉ QR", async () => {
    render(<PayoutAccountPage />);

    await userEvent.click(screen.getByRole("combobox", { name: "Ngân hàng" }));
    for (const name of ["Vietcombank · bank profile A", "VietinBank · bank profile B", "MB Bank · chỉ QR / ví"])
      expect(await screen.findByRole("option", { name })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "VietinBank · bank profile B" }));

    expect(screen.getByText(/kiểu bank-b \(không 3DS\)/)).toBeInTheDocument();
  });

  it("mở kênh: ngân hàng có thẻ + QR mà chỉ muốn QR thì bỏ thẻ, nhập tài khoản ở ngân hàng đó rồi mở", async () => {
    render(<PayoutAccountPage />);

    await pickBank("Vietcombank");
    await userEvent.click(screen.getByRole("checkbox", { name: "Thẻ ngân hàng" }));
    await userEvent.type(screen.getByLabelText("Tên chủ tài khoản"), "NGUYEN VAN A");
    await userEvent.type(screen.getByLabelText("Số tài khoản"), "0123 456 789");
    await userEvent.click(screen.getByRole("button", { name: "Mở kênh" }));

    expect(add.mock.calls[0][0]).toEqual({ bankCode: "VCB", paymentMethods: ["QR"], accountName: "NGUYEN VAN A",
      accountNumber: "0123456789" });
  });

  it("mở kênh mà chưa nhập tài khoản thì không cho mở, bỏ hết phương thức cũng vậy", async () => {
    render(<PayoutAccountPage />);

    await pickBank("MB Bank");
    expect(screen.getByRole("button", { name: "Mở kênh" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Tên chủ tài khoản"), "NGUYEN VAN A");
    await userEvent.type(screen.getByLabelText("Số tài khoản"), "0123456789");
    await userEvent.click(screen.getByRole("checkbox", { name: "QR / VietQR" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Chọn ít nhất một phương thức.");
    expect(screen.getByRole("button", { name: "Mở kênh" })).toBeDisabled();
  });

  it("nhiều kênh: liệt kê từng kênh với phương thức + tài khoản đã che, đánh dấu kênh chính", () => {
    state.account = withChannels(VCB_CHANNEL, TCB_CHANNEL);
    render(<PayoutAccountPage />);

    const vcb = screen.getByRole("article", { name: "Kênh Vietcombank" });
    expect(within(vcb).getByText("Kênh chính")).toBeInTheDocument();
    expect(within(vcb).getByText(/Tiền về NGUYEN VAN A · \*\*\*\*\*\*6789/)).toBeInTheDocument();
    const tcb = screen.getByRole("article", { name: "Kênh Techcombank" });
    expect(within(tcb).queryByText("Kênh chính")).not.toBeInTheDocument();
    expect(within(tcb).getByText("Google Pay")).toBeInTheDocument();
    expect(screen.getByText("Đang nhận thanh toán qua 2 kênh")).toBeInTheDocument();
  });

  it("thêm kênh: ngân hàng đã là kênh không có trong danh sách, phương thức của kênh khác bị khoá", async () => {
    state.account = withChannels(VCB_CHANNEL);
    render(<PayoutAccountPage />);

    await userEvent.click(screen.getByRole("button", { name: "Thêm kênh nhận tiền" }));
    await userEvent.click(screen.getByRole("combobox", { name: "Ngân hàng" }));
    expect(screen.queryByRole("option", { name: /^Vietcombank/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: /^Techcombank ·/ }));

    const qr = screen.getByRole("checkbox", { name: /QR \/ VietQR/ });
    expect(qr).toBeDisabled();
    expect(qr).not.toBeChecked();
    expect(screen.getByText("(đang ở kênh Vietcombank)")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Thẻ ngân hàng" })).toBeChecked();
  });

  it("sửa kênh chỉ đổi phương thức: không phải gõ lại tài khoản, không gửi tài khoản", async () => {
    state.account = withChannels({ ...VCB_CHANNEL, paymentMethods: ["CARD", "QR"], routableMethods: ["CARD", "QR"] });
    render(<PayoutAccountPage />);

    await userEvent.click(screen.getByRole("button", { name: "Sửa" }));
    const form = screen.getByRole("form", { name: "Sửa kênh Vietcombank" });
    await userEvent.click(within(form).getByRole("checkbox", { name: "Thẻ ngân hàng" }));
    await userEvent.click(within(form).getByRole("button", { name: "Lưu kênh" }));

    expect(update.mock.calls[0][0]).toEqual({ id: "c-vcb", paymentMethods: ["QR"] });
  });

  it("xoá kênh: chỉ còn một kênh thì không xoá được; nhiều kênh thì hỏi lại rồi mới xoá", async () => {
    state.account = withChannels(VCB_CHANNEL);
    const { unmount } = render(<PayoutAccountPage />);
    expect(screen.getByRole("button", { name: "Xoá" })).toBeDisabled();
    unmount();

    state.account = withChannels(VCB_CHANNEL, TCB_CHANNEL);
    render(<PayoutAccountPage />);
    const tcb = screen.getByRole("article", { name: "Kênh Techcombank" });
    await userEvent.click(within(tcb).getByRole("button", { name: "Xoá" }));
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(within(tcb).getByRole("button", { name: "Xoá kênh" }));

    expect(remove.mock.calls[0][0]).toBe("c-tcb");
  });

  it("phương thức đang bật mà cổng không còn đường đi thì cảnh báo trên kênh đó", () => {
    state.account = withChannels({ ...TCB_CHANNEL, primary: true, routableMethods: ["CARD"] });
    render(<PayoutAccountPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Google Pay đang bật nhưng khách chưa trả được");
  });
});
