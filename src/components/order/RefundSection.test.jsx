// Test khối hoàn vé trên trang đơn.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const created = [];
let refunds = [];

vi.mock("@/api", async (orig) => {
  const actual = await orig();
  return {
    normalizeError: actual.normalizeError,
    useAppConfig: () => ({ banks: [{ bin: "970436", name: "Vietcombank" }, { bin: "970422", name: "MB Bank" }] }),
    useOrderRefunds: () => ({ data: refunds, refetch: vi.fn() }),
    useCreateRefund: () => ({
      isPending: false,
      mutate: ({ body }) => created.push(body),
    }),
  };
});

const { RefundSection } = await import("./RefundSection");

const ticket = (id, status = "ACTIVE") => ({ id, ticketCode: `code-${id}`, tierName: "Standard", status });
const PAYER_ACCOUNT = "0123456789012";
const order = (over) => ({
  id: "o1",
  status: "PAID",
  tickets: [ticket("t1"), ticket("t2")],
  items: [{ unitPrice: 200000 }],
  payment: { payerAccountNumber: PAYER_ACCOUNT, payerBankBin: "970422", payerBankName: "MB Bank" },
  ...over,
});

beforeEach(() => {
  created.length = 0;
  refunds = [];
});

describe("RefundSection", () => {
  it("đơn PAID còn vé ACTIVE thì cho yêu cầu hoàn", () => {
    render(<RefundSection order={order()} />);
    expect(screen.getByRole("button", { name: /Yêu cầu hoàn vé/ })).toBeInTheDocument();
  });

  it("đơn chưa thanh toán thì không hiện gì", () => {
    const { container } = render(<RefundSection order={order({ status: "PENDING_PAYMENT", tickets: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("vé đã hoàn hết thì hết nút, nhưng vẫn xem được lịch sử", () => {
    refunds = [{ id: "r1", status: "SUCCEEDED", amount: 400000, items: [{}, {}], createdAt: "2026-09-29T10:00:00Z" }];
    render(<RefundSection order={order({ status: "REFUNDED", tickets: [ticket("t1", "REFUNDED")] })} />);
    expect(screen.queryByRole("button", { name: /Yêu cầu hoàn vé/ })).not.toBeInTheDocument();
    expect(screen.getByText("Đã hoàn tiền")).toBeInTheDocument();
  });

  it("chỉ gửi vé được chọn, bỏ chọn một vé thì không gửi vé đó", async () => {
    const user = userEvent.setup();
    render(<RefundSection order={order()} />);
    await user.click(screen.getByRole("button", { name: /Yêu cầu hoàn vé/ }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("Chọn vé (2/2)")).toBeInTheDocument();

    await user.click(within(dialog).getByLabelText(/Vé 2/));
    await user.click(within(dialog).getByRole("button", { name: "Hoàn tiền" }));

    expect(created).toEqual([
      { ticketIds: ["t1"], reason: undefined, destination: { bin: "970422", accountNumber: PAYER_ACCOUNT } },
    ]);
  });

  it("vé đang chờ hoàn không được chọn lại", async () => {
    const user = userEvent.setup();
    render(<RefundSection order={order({ tickets: [ticket("t1"), ticket("t2", "REFUND_PENDING")] })} />);
    await user.click(screen.getByRole("button", { name: /Yêu cầu hoàn vé/ }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("Chọn vé (1/1)")).toBeInTheDocument();
    expect(within(dialog).queryByText(/code-t2/)).not.toBeInTheDocument();
  });

  it("điền sẵn tài khoản đã thanh toán, nút báo hoàn tự động", async () => {
    const user = userEvent.setup();
    render(<RefundSection order={order()} />);
    await user.click(screen.getByRole("button", { name: /Yêu cầu hoàn vé/ }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByLabelText("Số tài khoản")).toHaveValue(PAYER_ACCOUNT);
    expect(within(dialog).getByText(/Trùng tài khoản đã thanh toán/)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Hoàn tiền" })).toBeInTheDocument();
  });

  it("đổi sang tài khoản khác thì chuyển sang đường ban tổ chức duyệt", async () => {
    const user = userEvent.setup();
    render(<RefundSection order={order()} />);
    await user.click(screen.getByRole("button", { name: /Yêu cầu hoàn vé/ }));

    const dialog = screen.getByRole("alertdialog");
    const input = within(dialog).getByLabelText("Số tài khoản");
    await user.clear(input);
    await user.type(input, "9999999999");

    expect(within(dialog).getByText(/Khác tài khoản đã thanh toán/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Gửi cho ban tổ chức duyệt" }));
    expect(created[0].destination).toEqual({ bin: "970422", accountNumber: "9999999999" });
  });

  it("cổng trả mã ngân hàng không dùng được thì bắt khách chọn ngân hàng", async () => {
    const user = userEvent.setup();
    render(<RefundSection order={order({ payment: { payerAccountNumber: PAYER_ACCOUNT, payerBankBin: null } })} />);
    await user.click(screen.getByRole("button", { name: /Yêu cầu hoàn vé/ }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("Cần chọn ngân hàng")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Số tài khoản")).toHaveValue(PAYER_ACCOUNT);
    expect(within(dialog).getByRole("button", { name: "Hoàn tiền" })).toBeDisabled();
  });

  it("refund MANUAL_REVIEW thì báo cho khách biết đang chờ người xử lý", () => {
    refunds = [{ id: "r1", status: "MANUAL_REVIEW", amount: 200000, items: [{}], createdAt: "2026-09-29T10:00:00Z", failureCode: "PAYOUT_UNAVAILABLE" }];
    render(<RefundSection order={order()} />);
    expect(screen.getByText(/ban tổ chức sẽ chuyển khoản thủ công/i)).toBeInTheDocument();
    expect(screen.getByText("Chờ duyệt thủ công")).toBeInTheDocument();
  });
});
