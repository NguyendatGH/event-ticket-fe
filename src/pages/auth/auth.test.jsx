import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import * as authApi from "@/api/services/auth";
import { useAuthStore } from "@/stores/auth";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ResetPasswordPage from "./ResetPasswordPage";
import { afterLoginPath, organizerRegisterSchema } from "./schemas";

vi.mock("@/api/services/auth", async (orig) => ({ ...(await orig()), login: vi.fn(), register: vi.fn(), resetPassword: vi.fn() }));

const user = { id: "u1", fullName: "Lê Thu Hà", email: "a@example.com", role: "CUSTOMER", organizer: null };
const authResponse = (u = user) => ({ accessToken: "a", refreshToken: "r", expiresIn: 900, user: u });

function renderRoute(element, path, initial = path) {
  const router = createMemoryRouter(
    [
      { path, element },
      { path: "*", element: <p>đích</p> },
    ],
    { initialEntries: [initial] }
  );
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
}

afterEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clear();
});

describe("afterLoginPath", () => {
  it("ưu tiên state.from, rồi organizer → /organizer, còn lại → /", () => {
    expect(afterLoginPath("/me/tickets?scope=past", { role: "ORGANIZER" })).toBe("/me/tickets?scope=past");
    expect(afterLoginPath(undefined, { role: "ORGANIZER" })).toBe("/organizer");
    expect(afterLoginPath(undefined, { role: "CUSTOMER" })).toBe("/");
  });
});

describe("LoginPage", () => {
  it("báo lỗi field khi để trống, không gọi API", async () => {
    renderRoute(<LoginPage />, "/auth/login");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByText("Email là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu là bắt buộc")).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("BAD_CREDENTIALS hiện lỗi chung", async () => {
    authApi.login.mockRejectedValue(new ApiError({ status: 401, code: "BAD_CREDENTIALS", message: "Email hoặc mật khẩu không đúng." }));
    renderRoute(<LoginPage />, "/auth/login");
    await userEvent.type(screen.getByLabelText("Email"), "a@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "sai123456");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email hoặc mật khẩu không đúng.");
  });

  it("đăng nhập xong lưu phiên và quay về state.from", async () => {
    authApi.login.mockResolvedValue(authResponse());
    const router = createMemoryRouter(
      [
        { path: "/auth/login", element: <LoginPage /> },
        { path: "*", element: <p>đích</p> },
      ],
      { initialEntries: [{ pathname: "/auth/login", state: { from: "/me/orders" } }] }
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    await userEvent.type(screen.getByLabelText("Email"), "a@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/me/orders"));
    expect(authApi.login).toHaveBeenCalledWith({ email: "a@example.com", password: "password123" }, expect.anything());
    expect(useAuthStore.getState().accessToken).toBe("a");
  });

  it("nút hiện/ẩn mật khẩu đổi type của ô", async () => {
    renderRoute(<LoginPage />, "/auth/login");
    const input = screen.getByLabelText("Mật khẩu");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    expect(input).toHaveAttribute("type", "text");
  });
});

describe("RegisterPage", () => {
  it("mật khẩu nhập lại không khớp", async () => {
    renderRoute(<RegisterPage />, "/auth/register");
    await userEvent.type(screen.getByLabelText("Họ và tên"), "Lê Thu Hà");
    await userEvent.type(screen.getByLabelText("Email"), "a@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "matkhau123");
    await userEvent.type(screen.getByLabelText("Nhập lại mật khẩu"), "matkhau124");
    await userEvent.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(await screen.findByText("Mật khẩu nhập lại không khớp")).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("EMAIL_ALREADY_USED gắn vào ô email", async () => {
    authApi.register.mockRejectedValue(new ApiError({ status: 409, code: "EMAIL_ALREADY_USED", message: "Email này đã được đăng ký." }));
    renderRoute(<RegisterPage />, "/auth/register");
    await userEvent.type(screen.getByLabelText("Họ và tên"), "Lê Thu Hà");
    await userEvent.type(screen.getByLabelText("Email"), "a@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "matkhau123");
    await userEvent.type(screen.getByLabelText("Nhập lại mật khẩu"), "matkhau123");
    await userEvent.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(await screen.findByText("Email này đã được đăng ký.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(authApi.register).toHaveBeenCalledWith({ fullName: "Lê Thu Hà", email: "a@example.com", password: "matkhau123" }, expect.anything());
  });
});

describe("ResetPasswordPage", () => {
  it("không có token → hướng dẫn gửi lại liên kết", () => {
    renderRoute(<ResetPasswordPage />, "/auth/reset-password");
    expect(screen.getByRole("heading", { name: "Thiếu liên kết đặt lại" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gửi lại liên kết" })).toHaveAttribute("href", "/auth/forgot-password");
  });

  it("TOKEN_EXPIRED → màn hết hạn", async () => {
    authApi.resetPassword.mockRejectedValue(new ApiError({ status: 410, code: "TOKEN_EXPIRED", message: "Hết hạn" }));
    renderRoute(<ResetPasswordPage />, "/auth/reset-password", "/auth/reset-password?token=abc");
    await userEvent.type(screen.getByLabelText("Mật khẩu mới"), "matkhau123");
    await userEvent.type(screen.getByLabelText("Nhập lại mật khẩu mới"), "matkhau123");
    await userEvent.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));
    expect(await screen.findByRole("heading", { name: "Liên kết đã hết hạn" })).toBeInTheDocument();
    expect(authApi.resetPassword).toHaveBeenCalledWith({ token: "abc", password: "matkhau123" }, expect.anything());
  });
});

describe("organizerRegisterSchema", () => {
  const base = { fullName: "Trần Quốc Bảo", email: "b@example.com", password: "matkhau123", confirmPassword: "matkhau123", organizerName: "Sunrise Live", organizerDescription: "", contactPhone: "", website: "", city: "", agree: true };
  it("hợp lệ khi field tùy chọn để trống", () => expect(organizerRegisterSchema.safeParse(base).success).toBe(true));
  it("bắt buộc đồng ý điều khoản, website phải có http", () => {
    const r = organizerRegisterSchema.safeParse({ ...base, agree: false, website: "sunrise.vn" });
    const paths = r.error.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["agree", "website"]));
  });
});
