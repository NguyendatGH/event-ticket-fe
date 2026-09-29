// Test trang Liên hệ và form gửi tin nhắn.

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const send = vi.fn();
vi.mock("@/api", async (orig) => ({
  ...(await orig()),
  useSendContact: () => ({
    isPending: false,
    mutate: (payload, { onSuccess, onError } = {}) => {
      const { ok, value } = send(payload);
      queueMicrotask(() => (ok ? onSuccess(value) : onError(value)));
    },
  }),
}));

const { default: ContactPage } = await import("./ContactPage");

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("ContactPage", () => {
  beforeEach(() => send.mockReset());

  it("báo lỗi tiếng Việt khi gửi form trống, không gọi API", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
    expect(await screen.findByText("Họ tên là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Email là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Nội dung là bắt buộc")).toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();
  });

  it("gửi đúng body (chủ đề gợi ý, rỗng → null) rồi hiện trạng thái đã gửi", async () => {
    send.mockReturnValue({
      ok: true,
      value: { id: "c1", createdAt: "2026-09-27T03:00:00Z" },
    });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Họ tên"), "Lê Thu Hà");
    await user.type(screen.getByLabelText("Email"), "thuha@example.com");
    await user.click(screen.getByRole("button", { name: "Vé và đơn hàng" }));
    await user.type(
      screen.getByLabelText("Nội dung"),
      "Tôi muốn hỏi về phí dịch vụ của đơn hàng.",
    );
    await user.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
    await waitFor(() => expect(send).toHaveBeenCalled());
    expect(send.mock.calls[0][0]).toEqual({
      name: "Lê Thu Hà",
      email: "thuha@example.com",
      subject: "Vé và đơn hàng",
      message: "Tôi muốn hỏi về phí dịch vụ của đơn hàng.",
    });
    expect(await screen.findByText("Đã gửi tin nhắn")).toBeInTheDocument();
  });

  it("đổ lỗi field từ BE vào form", async () => {
    send.mockReturnValue({
      ok: false,
      value: new ApiError({
        status: 400,
        code: "VALIDATION",
        message: "Dữ liệu không hợp lệ",
        errors: [{ field: "email", message: "Email đã bị chặn" }],
      }),
    });
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Họ tên"), "Lê Thu Hà");
    await user.type(screen.getByLabelText("Email"), "x@example.com");
    await user.type(
      screen.getByLabelText("Nội dung"),
      "Nội dung đủ dài để gửi.",
    );
    await user.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
    expect(await screen.findByText("Email đã bị chặn")).toBeInTheDocument();
  });
});
