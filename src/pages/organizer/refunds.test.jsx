import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RefundsPage from "./RefundsPage";
import { RefundsInboxLink } from "./components/RefundsInboxLink";

const api = vi.hoisted(() => ({
  useOrganizerRefunds: vi.fn(),
  useRefundInstruction: vi.fn(),
  useResolveRefund: vi.fn(),
  useAppConfig: vi.fn(),
}));
vi.mock("@/api", async (orig) => ({ ...(await orig()), ...api }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const refund = (over = {}) => ({
  id: "rf-1",
  orderId: "0f1e2d3c-4b5a-6978-8899-aabbccdd1234",
  status: "MANUAL_REVIEW",
  amount: 200000,
  items: [{ ticketId: "t1", amount: 200000 }],
  destinationBin: "970436",
  destinationAccountMasked: "*********1234",
  destinationIsPayer: true,
  failureCode: "PAYOUT_UNAVAILABLE",
  providerRefundId: null,
  createdAt: "2026-09-29T10:00:00Z",
  ...over,
});

const INSTRUCTION = {
  qrImageUrl: "https://img.vietqr.io/image/970436-123-compact2.png",
  bankBin: "970436",
  bankName: "Vietcombank",
  accountNumber: "1234567890",
  amount: 200000,
  content: "HOAN VE 12345",
};

const routes = [{ path: "/organizer/refunds", element: <RefundsPage /> }];

function renderAt(path, els = routes) {
  const router = createMemoryRouter(els, { initialEntries: [path] });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

const table = () => within(screen.getByRole("table"));

beforeEach(() => {
  vi.clearAllMocks();
  api.useAppConfig.mockReturnValue({ banks: [{ bin: "970436", name: "Vietcombank" }] });
  api.useRefundInstruction.mockReturnValue({ isPending: false, isError: false, data: INSTRUCTION });
  api.useResolveRefund.mockReturnValue({ mutate: vi.fn(), isPending: false, error: null });
});

describe("RefundsPage", () => {
  it("mặc định chỉ hiện việc cần xử lý, kèm cảnh báo ví chi thiếu tiền", () => {
    api.useOrganizerRefunds.mockReturnValue({
      data: [refund(), refund({ id: "rf-2", status: "AWAITING_FUNDS", failureCode: "INSUFFICIENT_PAYOUT_BALANCE" }), refund({ id: "rf-3", status: "SUCCEEDED", failureCode: null })],
    });
    renderAt("/organizer/refunds");

    expect(table().getAllByRole("row")).toHaveLength(3);
    expect(table().getByText("Chờ duyệt thủ công")).toBeInTheDocument();
    expect(table().getByText("Đang chờ nguồn tiền")).toBeInTheDocument();
    expect(table().queryByText("Đã hoàn tiền")).not.toBeInTheDocument();
    expect(screen.getByText(/Ví chi của cổng thanh toán không đủ tiền/)).toBeInTheDocument();
    expect(screen.getByText(/quá 24 giờ/i)).toBeInTheDocument();
  });

  it("đổi tab ghi lên URL và lọc lại danh sách", async () => {
    api.useOrganizerRefunds.mockReturnValue({ data: [refund(), refund({ id: "rf-3", status: "SUCCEEDED", failureCode: null })] });
    const router = renderAt("/organizer/refunds");

    await userEvent.click(screen.getByRole("tab", { name: /Tất cả/ }));
    expect(router.state.location.search).toBe("?status=ALL");
    expect(table().getAllByRole("row")).toHaveLength(3);
  });

  it("mở trang theo ?status= trong URL (bookmark / F5 không mất filter)", () => {
    api.useOrganizerRefunds.mockReturnValue({ data: [refund(), refund({ id: "rf-3", status: "SUCCEEDED", failureCode: null })] });
    renderAt("/organizer/refunds?status=SUCCEEDED");

    expect(screen.getByRole("tab", { name: /Đã hoàn tiền/ })).toHaveAttribute("aria-selected", "true");
    expect(table().getAllByRole("row")).toHaveLength(2);
    expect(table().getByText("Đã hoàn tiền")).toBeInTheDocument();
  });

  it("không có việc gì thì nói rõ là không có việc, không để trang trắng", () => {
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ status: "SUCCEEDED", failureCode: null })] });
    renderAt("/organizer/refunds");

    expect(screen.getByText("Không có yêu cầu nào cần bạn xử lý")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xem tất cả yêu cầu" })).toBeInTheDocument();
  });

  it("MANUAL_REVIEW: mở hướng dẫn chuyển khoản, phải xác nhận 2 bước mới gọi API", async () => {
    const user = userEvent.setup();
    const resolve = { mutate: vi.fn(), isPending: false, error: null };
    api.useResolveRefund.mockReturnValue(resolve);
    api.useOrganizerRefunds.mockReturnValue({ data: [refund()] });
    renderAt("/organizer/refunds");

    await user.click(table().getByRole("button", { name: "Xử lý" }));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("Vietcombank")).toBeInTheDocument();
    expect(within(dialog).getByText("1234567890")).toBeInTheDocument();
    expect(within(dialog).getByText("HOAN VE 12345")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Copy số tài khoản/ })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Đã chuyển xong" }));
    expect(resolve.mutate).not.toHaveBeenCalled();
    expect(within(dialog).getByText("Xác nhận đã chuyển tiền cho khách?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Đúng, tôi đã chuyển tiền" }));
    await waitFor(() => expect(resolve.mutate).toHaveBeenCalledTimes(1));
    expect(resolve.mutate.mock.calls[0][0]).toEqual({ id: "rf-1", body: { outcome: "SUCCEEDED", note: undefined } });
  });

  it("từ chối thì bắt nhập ghi chú trước khi chốt", async () => {
    const user = userEvent.setup();
    const resolve = { mutate: vi.fn(), isPending: false, error: null };
    api.useResolveRefund.mockReturnValue(resolve);
    api.useOrganizerRefunds.mockReturnValue({ data: [refund()] });
    renderAt("/organizer/refunds");

    await user.click(table().getByRole("button", { name: "Xử lý" }));
    await user.click(screen.getByRole("button", { name: "Không chuyển được" }));
    expect(screen.getByRole("button", { name: "Từ chối yêu cầu" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Quay lại" }));
    await user.type(screen.getByLabelText(/Ghi chú/), "Khách đổi ý, không hoàn nữa");
    await user.click(screen.getByRole("button", { name: "Không chuyển được" }));
    await user.click(screen.getByRole("button", { name: "Từ chối yêu cầu" }));

    expect(resolve.mutate.mock.calls[0][0]).toEqual({
      id: "rf-1",
      body: { outcome: "FAILED", note: "Khách đổi ý, không hoàn nữa" },
    });
  });

  it("cổng đã nhận lệnh thì không cho gửi lại (tránh chi hai lần)", async () => {
    const user = userEvent.setup();
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ providerRefundId: "payos-1", failureCode: "PROCESSING_TIMEOUT" })] });
    renderAt("/organizer/refunds");

    await user.click(table().getByRole("button", { name: "Xử lý" }));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).queryByRole("button", { name: "Gửi lại qua cổng" })).not.toBeInTheDocument();
    expect(within(dialog).getByText(/đã nhận lệnh này rồi/)).toBeInTheDocument();
  });

  it("refund chưa có tài khoản nhận: báo lỗi tử tế, vẫn chốt được", async () => {
    const user = userEvent.setup();
    api.useRefundInstruction.mockReturnValue({
      isPending: false,
      isError: true,
      error: { code: "REFUND_DESTINATION_UNKNOWN", status: 409, message: "..." },
      refetch: vi.fn(),
    });
    api.useOrganizerRefunds.mockReturnValue({ data: [refund()] });
    renderAt("/organizer/refunds");

    await user.click(table().getByRole("button", { name: "Xử lý" }));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("Chưa dựng được QR cho yêu cầu này")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Không chuyển được" })).toBeInTheDocument();
  });

  it("lỗi tải danh sách → ErrorState có nút thử lại", () => {
    api.useOrganizerRefunds.mockReturnValue({ isError: true, error: { message: "Không kết nối được máy chủ." }, refetch: vi.fn() });
    renderAt("/organizer/refunds");
    expect(screen.getByRole("alert")).toHaveTextContent("Không kết nối được máy chủ.");
  });
});

describe("RefundsPage — hủy hoàn tiền", () => {
  const cancelBtn = () => table().queryByRole("button", { name: "Hủy hoàn tiền" });

  it("hiện nút hủy cho AWAITING_FUNDS và MANUAL_REVIEW", () => {
    api.useOrganizerRefunds.mockReturnValue({
      data: [refund(), refund({ id: "rf-2", status: "AWAITING_FUNDS", failureCode: "INSUFFICIENT_PAYOUT_BALANCE" })],
    });
    renderAt("/organizer/refunds");

    expect(table().getAllByRole("button", { name: "Hủy hoàn tiền" })).toHaveLength(2);
  });

  // Các trạng thái này BE trả 409 nếu cố hủy, nên đừng hiện nút rồi để BTC ăn lỗi.
  it.each(["REQUESTED", "PROCESSING", "SUCCEEDED", "FAILED"])("trạng thái %s thì không cho hủy", (status) => {
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ status, failureCode: null })] });
    renderAt("/organizer/refunds?status=ALL");

    expect(cancelBtn()).not.toBeInTheDocument();
  });

  it("cổng đã nhận lệnh chi thì không cho hủy, nói rõ phải làm gì", () => {
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ status: "AWAITING_FUNDS", providerRefundId: "payos-1" })] });
    renderAt("/organizer/refunds");

    expect(cancelBtn()).not.toBeInTheDocument();
    expect(table().getByText(/Cổng đã nhận lệnh chi nên không hủy được/)).toBeInTheDocument();
  });

  it("bắt nhập lý do, và phải qua bước xác nhận mới gọi API", async () => {
    const user = userEvent.setup();
    const resolve = { mutate: vi.fn(), isPending: false, error: null };
    api.useResolveRefund.mockReturnValue(resolve);
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ status: "AWAITING_FUNDS" })] });
    renderAt("/organizer/refunds");

    await user.click(cancelBtn());
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByRole("button", { name: "Tiếp tục" })).toBeDisabled();

    await user.type(within(dialog).getByLabelText("Lý do hủy"), "Ngoài thời hạn hoàn vé");
    await user.click(within(dialog).getByRole("button", { name: "Tiếp tục" }));

    expect(resolve.mutate).not.toHaveBeenCalled();
    expect(screen.getByText("Xác nhận hủy yêu cầu hoàn tiền?")).toBeInTheDocument();
    expect(screen.getByText("Ngoài thời hạn hoàn vé")).toBeInTheDocument();
    expect(screen.getByText(/Vé của khách quay về trạng thái hợp lệ/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hủy yêu cầu hoàn tiền" }));
    await waitFor(() => expect(resolve.mutate).toHaveBeenCalledTimes(1));
    expect(resolve.mutate.mock.calls[0][0]).toEqual({
      id: "rf-1",
      body: { outcome: "CANCELLED", note: "Ngoài thời hạn hoàn vé" },
    });
  });

  it("lỗi BE hiện câu tiếng Việt theo mã, không phải câu chung của HTTP 409", async () => {
    const user = userEvent.setup();
    api.useResolveRefund.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: { response: { status: 409, data: { code: "REFUND_ALREADY_AT_PROVIDER", detail: "already at provider" } } },
    });
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ status: "AWAITING_FUNDS" })] });
    renderAt("/organizer/refunds");

    await user.click(table().getByRole("button", { name: "Hủy hoàn tiền" }));
    await user.type(screen.getByLabelText("Lý do hủy"), "Ngoài thời hạn hoàn vé");
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(screen.getByText(/Tra dashboard PayOS xem tiền đã đi chưa/)).toBeInTheDocument();
  });

  it("yêu cầu đã được chốt ở nơi khác (409 REFUND_NOT_CANCELLABLE): nói nhẹ, không báo đỏ", async () => {
    const user = userEvent.setup();
    const conflict = { response: { status: 409, data: { code: "REFUND_NOT_CANCELLABLE", detail: "not cancellable" } } };
    const resolve = { mutate: vi.fn((_vars, opts) => opts.onError(conflict)), isPending: false, error: null };
    api.useResolveRefund.mockReturnValue(resolve);
    api.useOrganizerRefunds.mockReturnValue({ data: [refund({ status: "AWAITING_FUNDS" })] });
    renderAt("/organizer/refunds");

    await user.click(table().getByRole("button", { name: "Hủy hoàn tiền" }));
    await user.type(screen.getByLabelText("Lý do hủy"), "Ngoài thời hạn hoàn vé");
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await user.click(screen.getByRole("button", { name: "Hủy yêu cầu hoàn tiền" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/đã được hủy hoặc chốt ở nơi khác/));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("refund đã hủy hiện “Đã hủy”, còn FAILED thường vẫn là “Hoàn tiền thất bại”", () => {
    api.useOrganizerRefunds.mockReturnValue({
      data: [
        refund({ status: "FAILED", failureCode: "CANCELLED_BY_ORGANIZER", failureReason: "Ngoài thời hạn hoàn vé" }),
        refund({ id: "rf-2", status: "FAILED", failureCode: "INVALID_DESTINATION" }),
      ],
    });
    renderAt("/organizer/refunds?status=ALL");

    expect(table().getByText("Đã hủy")).toBeInTheDocument();
    expect(table().getByText("Hoàn tiền thất bại")).toBeInTheDocument();
    expect(table().getByText("Ngoài thời hạn hoàn vé")).toBeInTheDocument();
  });
});

describe("RefundsInboxLink", () => {
  const link = () => screen.getByRole("link", { name: /Hoàn tiền/ });

  it("có việc cần xử lý thì badge đếm đúng số và nổi bật", () => {
    api.useOrganizerRefunds.mockReturnValue({
      data: [refund(), refund({ id: "rf-2", status: "AWAITING_FUNDS" }), refund({ id: "rf-3", status: "SUCCEEDED" })],
    });
    renderAt("/organizer", [{ path: "/organizer", element: <RefundsInboxLink /> }]);

    expect(link()).toHaveAttribute("href", "/organizer/refunds");
    expect(link()).toHaveTextContent("2");
    expect(screen.getByText("2").closest("[data-slot=badge]")).toHaveAttribute("data-variant", "warning");
  });

  it("không có việc thì badge 0, tone nhạt", () => {
    api.useOrganizerRefunds.mockReturnValue({ data: [] });
    renderAt("/organizer", [{ path: "/organizer", element: <RefundsInboxLink /> }]);

    expect(link()).toHaveTextContent("0");
    expect(screen.getByText("0").closest("[data-slot=badge]")).toHaveAttribute("data-variant", "muted");
  });
});
