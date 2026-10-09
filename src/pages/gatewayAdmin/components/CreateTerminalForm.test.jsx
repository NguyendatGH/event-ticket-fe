import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mutate, routes, hookOptions, toastSuccess } = vi.hoisted(() => ({
  mutate: vi.fn(),
  routes: { current: {} },
  hookOptions: { current: null },
  toastSuccess: vi.fn(),
}));

vi.mock("@/api", () => ({
  useCreateGatewayTerminal: (options) => {
    hookOptions.current = options;
    return { mutate, isPending: false };
  },
  useGatewayRoutingProfiles: () => ({ data: [{ code: "STANDARD", name: "Thẻ + QR" }] }),
  useGatewayRoutingProfile: (code) => ({ data: code ? { code, routes: routes.current } : undefined }),
  useGatewayAcquirers: () => ({ data: [
    { code: "bank-a", threeDsSupported: true },
    { code: "bank-b", threeDsSupported: false },
    { code: "QR_PROVIDER_A", threeDsSupported: false },
  ] }),
}));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: vi.fn() } }));

const { CreateTerminalForm } = await import("./CreateTerminalForm");

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

async function fill({ name = "Web QR", profile = "STANDARD" } = {}) {
  await userEvent.type(screen.getByLabelText("Terminal Name / Label"), name);
  await userEvent.click(screen.getByRole("combobox", { name: "Routing Profile (bắt buộc)" }));
  await userEvent.click(await screen.findByRole("option", { name: new RegExp(profile) }));
}

describe("CreateTerminalForm", () => {
  beforeEach(() => {
    mutate.mockReset();
    toastSuccess.mockReset();
    routes.current = {
      CARD: [{ priority: 1, acquirerCode: "bank-a" }],
      QR: [{ priority: 1, acquirerCode: "QR_PROVIDER_A" }],
    };
  });

  it("tạo terminal thẻ + QR gửi đúng phương thức đã chọn và mặc định cho Encore dùng ngay", async () => {
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId="TerNo000001" />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "+ Create Terminal" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({
      merNo: "MerNo000001", name: "Web QR", paymentMethods: ["CARD", "QR"],
      threeDsPolicy: "OPTIONAL", routingProfileCode: "STANDARD", activate: true,
    });
  });

  it("bỏ tick dùng ngay thì chỉ tạo, Encore vẫn thu qua terminal cũ", async () => {
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId="TerNo000001" />);

    await userEvent.click(screen.getByRole("checkbox", { name: /Encore dùng terminal này ngay/ }));
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "+ Create Terminal" }));

    expect(mutate.mock.calls[0][0]).toMatchObject({ activate: false });
  });

  it("merchant chưa gắn BTC nào thì không có ô dùng ngay", () => {
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId={null} />);

    expect(screen.queryByRole("checkbox", { name: /Encore dùng terminal này ngay/ })).not.toBeInTheDocument();
  });

  it("chỉ QR thì khóa ô 3DS và gửi policy null", async () => {
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId={null} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "CARD" }));
    expect(screen.getByRole("combobox", { name: "3D Secure Policy" })).toBeDisabled();

    await fill();
    await userEvent.click(screen.getByRole("button", { name: "+ Create Terminal" }));
    expect(mutate.mock.calls[0][0]).toMatchObject({ paymentMethods: ["QR"], threeDsPolicy: null });
  });

  it("profile chưa có rule cho QR thì báo trước khi tạo", async () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-a" }] };
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId={null} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "QR" }));
    await fill();

    expect(screen.getByRole("alert")).toHaveTextContent("chưa có rule cho QR");
  });

  it("3DS REQUIRED mà route thẻ chỉ tới acquirer không có 3DS thì báo trước khi tạo", async () => {
    routes.current = { CARD: [{ priority: 1, acquirerCode: "bank-b" }] };
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId={null} />);

    await userEvent.click(screen.getByRole("combobox", { name: "3D Secure Policy" }));
    await userEvent.click(await screen.findByRole("option", { name: "REQUIRED" }));
    await fill();

    expect(screen.getByRole("alert")).toHaveTextContent("không acquirer nào có 3DS");
  });

  it("server đã chuyển Encore sang terminal mới thì báo đang dùng", () => {
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId="TerNo000001" />);

    hookOptions.current.onSuccess({ terminalId: "TerNo000009", usedByEncore: true });

    expect(toastSuccess).toHaveBeenCalledWith(expect.stringContaining("Encore thu tiền qua terminal này từ giờ"));
  });

  it("không chuyển thì nhắc rằng Encore vẫn thu qua terminal cũ", () => {
    render(<CreateTerminalForm merNo="MerNo000001" activeTerminalId="TerNo000001" />);

    hookOptions.current.onSuccess({ terminalId: "TerNo000009", usedByEncore: false });

    expect(toastSuccess).toHaveBeenCalledWith(expect.stringContaining("Encore vẫn thu tiền qua TerNo000001"));
  });
});
