// Form cấu hình terminal: methods + 3DS + routing phải đi trong MỘT request, kiểm trên trạng thái cuối.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutate, routes } = vi.hoisted(() => ({
  mutate: vi.fn(),
  routes: { current: { CARD: [{ priority: 1, acquirerCode: "bank-a" }] } },
}));

vi.mock("@/api", () => ({
  useConfigureTerminal: () => ({ mutate, isPending: false }),
  useGatewayRoutingProfiles: () => ({ data: [{ code: "CARD_VIA_BANK_A", name: "Thẻ" }] }),
  useGatewayRoutingProfile: () => ({ data: { code: "CARD_VIA_BANK_A", routes: routes.current } }),
  useGatewayAcquirers: () => ({ data: [
    { code: "bank-a", threeDsSupported: true },
    { code: "bank-b", threeDsSupported: false },
  ] }),
}));

const { TerminalConfigForm } = await import("./TerminalConfigForm");

const terminal = {
  terminalId: "TerNo000001",
  paymentMethods: ["CARD"],
  threeDsPolicy: "OPTIONAL",
  routingProfileCode: "CARD_VIA_BANK_A",
  routingProfile: { routes: { CARD: [{ priority: 1, acquirerCode: "bank-a" }] } },
};

describe("TerminalConfigForm", () => {
  beforeEach(() => {
    mutate.mockReset();
    routes.current = {
      CARD: [{ priority: 1, acquirerCode: "bank-a" }],
      QR: [{ priority: 1, acquirerCode: "QR_PROVIDER_A" }],
    };
  });

  it("thêm QR gửi methods, 3DS và routing trong cùng một request", async () => {
    render(<TerminalConfigForm terminal={terminal} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toEqual({
      terminalId: "TerNo000001",
      paymentMethods: ["CARD", "QR"],
      threeDsPolicy: "OPTIONAL",
      routingProfileCode: "CARD_VIA_BANK_A",
    });
  });

  it("bỏ CARD thì khóa ô 3DS và gửi policy null, để terminal chỉ-QR lưu được", async () => {
    render(<TerminalConfigForm terminal={terminal} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "CARD" }));

    expect(screen.getByRole("combobox", { name: "3D Secure Policy" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(mutate.mock.calls[0][0]).toMatchObject({ paymentMethods: ["QR"], threeDsPolicy: null });
  });

  it("báo trước khi lưu nếu profile đang chọn chưa có rule cho method đã tick", async () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-a" }] };
    render(<TerminalConfigForm terminal={terminal} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));

    expect(screen.getByRole("alert")).toHaveTextContent("chưa có rule cho QR");
  });

  it("method đã tick mà không còn route dùng được thì báo khách không thấy", () => {
    render(<TerminalConfigForm terminal={{ ...terminal, paymentMethods: ["CARD", "QR"], routableMethods: ["CARD"] }} />);

    expect(screen.getByRole("status")).toHaveTextContent("khách không thấy: QR");
  });

  it("3DS REQUIRED mà route thẻ chỉ tới acquirer không có 3DS thì báo trước khi lưu", () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-b" }] };
    render(<TerminalConfigForm terminal={{ ...terminal, threeDsPolicy: "REQUIRED" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("chỉ tới bank-b, không acquirer nào có 3DS");
  });

  it("terminal theo ngân hàng BTC chọn: lưu mà không chọn profile thì giữ nguyên ngân hàng đó", async () => {
    render(<TerminalConfigForm terminal={{ ...terminal, routingProfileCode: null, routingProfile: null, acquirerCode: "VCB" }} />);

    expect(screen.getByRole("status")).toHaveTextContent("Ban tổ chức đã tự chọn ngân hàng VCB");
    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(mutate.mock.calls[0][0]).toMatchObject({ paymentMethods: ["CARD", "QR"], routingProfileCode: null, acquirerCode: "VCB" });
  });
});
