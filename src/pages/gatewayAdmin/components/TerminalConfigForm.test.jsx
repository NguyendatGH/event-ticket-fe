import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutate, addConfig, routes, acquirers, connections } = vi.hoisted(() => ({
  mutate: vi.fn(),
  addConfig: vi.fn(),
  routes: { current: { CARD: [{ priority: 1, acquirerCode: "bank-a" }] } },
  acquirers: { current: [] },
  connections: { current: [] },
}));

vi.mock("@/api", () => ({
  useConfigureTerminal: () => ({ mutate, isPending: false }),
  useGatewayRoutingProfiles: () => ({ data: [{ code: "CARD_VIA_BANK_A", name: "Thẻ" }] }),
  useGatewayRoutingProfile: () => ({ data: { code: "CARD_VIA_BANK_A", routes: routes.current } }),
  useGatewayAcquirers: () => ({ data: acquirers.current }),
  useGatewayAcquirerConfigs: () => ({ data: connections.current }),
  useAddGatewayAcquirerConfig: () => ({ mutate: addConfig, isPending: false }),
}));

const { TerminalConfigForm } = await import("./TerminalConfigForm");

const renderForm = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const terminal = {
  merNo: "MerNo000001",
  terminalId: "TerNo000001",
  paymentMethods: ["CARD"],
  threeDsPolicy: "OPTIONAL",
  routingProfileCode: "CARD_VIA_BANK_A",
  routingProfile: { routes: { CARD: [{ priority: 1, acquirerCode: "bank-a" }] } },
};

describe("TerminalConfigForm", () => {
  beforeEach(() => {
    mutate.mockReset();
    addConfig.mockReset();
    acquirers.current = [
      { code: "bank-a", status: "ACTIVE", paymentMethods: ["CARD", "GOOGLE_PAY"], threeDsSupported: true },
      { code: "bank-b", status: "ACTIVE", paymentMethods: ["CARD"], threeDsSupported: false },
      { code: "QR_PROVIDER_A", status: "ACTIVE", paymentMethods: ["QR"], threeDsSupported: false },
    ];
    connections.current = [
      { acquirerCode: "bank-a", status: "ACTIVE" },
      { acquirerCode: "QR_PROVIDER_A", status: "ACTIVE" },
    ];
    routes.current = {
      CARD: [{ priority: 1, acquirerCode: "bank-a" }],
      QR: [{ priority: 1, acquirerCode: "QR_PROVIDER_A" }],
    };
  });

  it("thêm QR gửi methods, 3DS và routing trong cùng một request", async () => {
    renderForm(<TerminalConfigForm terminal={terminal} />);

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
    renderForm(<TerminalConfigForm terminal={terminal} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "CARD" }));

    expect(screen.getByRole("combobox", { name: "3D Secure Policy" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(mutate.mock.calls[0][0]).toMatchObject({ paymentMethods: ["QR"], threeDsPolicy: null });
  });

  it("báo trước khi lưu nếu profile đang chọn chưa có rule cho method đã tick", async () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-a" }] };
    renderForm(<TerminalConfigForm terminal={terminal} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));

    expect(screen.getByRole("alert")).toHaveTextContent("chưa có rule cho QR");
  });

  it("method đã tick mà không còn route dùng được thì báo khách không thấy", () => {
    renderForm(<TerminalConfigForm terminal={{ ...terminal, paymentMethods: ["CARD", "QR"], routableMethods: ["CARD"] }} />);

    expect(screen.getByRole("status")).toHaveTextContent("khách không thấy: QR");
  });

  it("3DS REQUIRED mà route thẻ chỉ tới acquirer không có 3DS thì báo trước khi lưu", () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-b" }] };
    renderForm(<TerminalConfigForm terminal={{ ...terminal, threeDsPolicy: "REQUIRED" }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("chỉ tới bank-b, không acquirer nào có 3DS");
  });

  it("terminal theo ngân hàng BTC chọn: lưu mà không chọn profile thì giữ nguyên ngân hàng đó", async () => {
    renderForm(<TerminalConfigForm terminal={{ ...terminal, routingProfileCode: null, routingProfile: null, acquirerCode: "VCB" }} />);

    expect(screen.getByRole("status")).toHaveTextContent("Ban tổ chức đã tự chọn ngân hàng VCB");
    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(mutate.mock.calls[0][0]).toMatchObject({ paymentMethods: ["CARD", "QR"], routingProfileCode: null, acquirerCode: "VCB" });
  });

  it("bảng đường đi: method có rule + acquirer nhận + merchant đã nối thì báo khách thấy", () => {
    renderForm(<TerminalConfigForm terminal={terminal} />);

    expect(screen.getByText("Khách thấy")).toBeInTheDocument();
    expect(screen.getByText("✓ nhận CARD · đã nối")).toBeInTheDocument();
  });

  it("Google Pay: rule trỏ tới acquirer chưa nối merchant thì báo thiếu và nối ngay tại dòng, MID/TID điền sẵn", async () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-a" }], GOOGLE_PAY: [{ priority: 1, acquirerCode: "test-acquirer" }] };
    acquirers.current = [...acquirers.current,
      { code: "test-acquirer", status: "ACTIVE", paymentMethods: ["GOOGLE_PAY"], threeDsSupported: false }];
    renderForm(<TerminalConfigForm terminal={{ ...terminal, paymentMethods: ["CARD", "GOOGLE_PAY"] }} />);

    expect(screen.getByText("Khách không thấy")).toBeInTheDocument();
    expect(screen.getByText("merchant chưa nối")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Nối ngay test-acquirer" }));
    expect(screen.getByRole("textbox", { name: "MID của test-acquirer" })).toHaveValue("MID-MerNo000001-test-acquirer");
    await userEvent.click(screen.getByRole("button", { name: "Nối" }));

    expect(addConfig).toHaveBeenCalledWith({
      merNo: "MerNo000001", acquirerCode: "test-acquirer",
      mid: "MID-MerNo000001-test-acquirer", tid: "TID-MerNo000001-test-acquirer",
    });
  });

  it("acquirer không nhận method thì nói rõ, không đề nghị nối", () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-a" }], GOOGLE_PAY: [{ priority: 1, acquirerCode: "bank-b" }] };
    renderForm(<TerminalConfigForm terminal={{ ...terminal, paymentMethods: ["CARD", "GOOGLE_PAY"] }} />);

    expect(screen.getByText(/không nhận GOOGLE_PAY/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nối ngay bank-b" })).not.toBeInTheDocument();
  });
});
