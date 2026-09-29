// Test nút đăng nhập Google (giả lập Google Identity Services).

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "@/api/services/auth";
import * as configApi from "@/api/services/config";
import { useAuthStore } from "@/stores/auth";
import { GoogleAuthButton } from "./components";

vi.mock("@/api/services/auth", async (orig) => ({ ...(await orig()), googleLogin: vi.fn() }));
vi.mock("@/api/services/config", async (orig) => ({ ...(await orig()), get: vi.fn() }));

const authResponse = {
  accessToken: "a",
  refreshToken: "r",
  expiresIn: 900,
  user: { id: "u1", fullName: "Lê Thu Hà", email: "a@example.com", role: "CUSTOMER" },
};

function stubGsi() {
  const gsi = { initialize: vi.fn(), renderButton: vi.fn(), callback: null };
  gsi.initialize.mockImplementation(({ callback }) => {
    gsi.callback = callback;
  });
  window.google = { accounts: { id: gsi } };
  return gsi;
}

const renderButton = (props = {}) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } })}>
      <GoogleAuthButton {...props} />
    </QueryClientProvider>
  );

let gsi;
beforeEach(() => {
  gsi = stubGsi();
});

afterEach(() => {
  vi.clearAllMocks();
  delete window.google;
  useAuthStore.getState().clear();
});

describe("GoogleAuthButton", () => {
  it("BE chưa cấu hình client id thì không hiện gì", async () => {
    configApi.get.mockResolvedValue({ checkoutFee: 12000, googleClientId: null });

    renderButton();

    await waitFor(() => expect(configApi.get).toHaveBeenCalled());
    expect(screen.queryByText("hoặc")).toBeNull();
    expect(gsi.renderButton).not.toHaveBeenCalled();
  });

  it("có client id thì khởi tạo GIS và nhờ Google vẽ nút", async () => {
    configApi.get.mockResolvedValue({ checkoutFee: 12000, googleClientId: "client-abc" });

    renderButton({ text: "signup_with" });

    await waitFor(() => expect(gsi.renderButton).toHaveBeenCalled());
    expect(gsi.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: "client-abc" }));
    expect(gsi.renderButton.mock.calls[0][1]).toMatchObject({ text: "signup_with" });
  });

  it("Google trả credential → POST /auth/google, lưu phiên và gọi onSuccess", async () => {
    configApi.get.mockResolvedValue({ checkoutFee: 12000, googleClientId: "client-abc" });
    authApi.googleLogin.mockResolvedValue(authResponse);
    const onSuccess = vi.fn();

    renderButton({ onSuccess });
    await waitFor(() => expect(gsi.callback).toBeTypeOf("function"));

    await act(async () => gsi.callback({ credential: "id-token-123" }));

    await waitFor(() => expect(authApi.googleLogin).toHaveBeenCalled());
    expect(authApi.googleLogin.mock.calls[0][0]).toBe("id-token-123");
    expect(onSuccess.mock.calls[0][0]).toEqual(authResponse);
    expect(useAuthStore.getState().accessToken).toBe("a");
  });

  it("BE từ chối token thì hiện lỗi, không lưu phiên", async () => {
    configApi.get.mockResolvedValue({ checkoutFee: 12000, googleClientId: "client-abc" });
    authApi.googleLogin.mockRejectedValue(new Error("Token Google không hợp lệ hoặc đã hết hạn"));

    renderButton();
    await waitFor(() => expect(gsi.callback).toBeTypeOf("function"));

    await act(async () => gsi.callback({ credential: "hong" }));

    expect(await screen.findByText("Token Google không hợp lệ hoặc đã hết hạn")).toBeTruthy();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
