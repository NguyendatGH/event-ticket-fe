// Test khung trang: Header, CategoryNav, Footer.

import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { CategoryNav } from "./CategoryNav";
import { Footer } from "./Footer";
import { Header } from "./Header";

const renderAt = (ui, path = "/") =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );

describe("CategoryNav", () => {
  it("đánh dấu danh mục theo ?category trên /events", () => {
    renderAt(<CategoryNav />, "/events?category=sport");
    const nav = screen.getByRole("navigation", { name: "Danh mục sự kiện" });
    expect(within(nav).getByRole("link", { name: "Thể thao" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Thể thao" })).toHaveAttribute("href", "/events?category=sport");
    expect(within(nav).getByRole("link", { name: "Tất cả sự kiện" })).not.toHaveAttribute("aria-current");
  });

  it("trang ngoài /events không mục nào active", () => {
    renderAt(<CategoryNav />, "/contact");
    expect(screen.queryByRole("link", { current: "page" })).toBeNull();
  });
});

describe("Header", () => {
  it("khách: có ô tìm, Tạo sự kiện → đăng ký BTC, Đăng nhập | Đăng ký", () => {
    renderAt(<Header />);
    expect(screen.getAllByRole("search").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Tạo sự kiện" })).toHaveAttribute("href", "/auth/register-organizer");
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/auth/login");
    expect(screen.getByRole("link", { name: "Đăng ký" })).toHaveAttribute("href", "/auth/register");
  });
});

describe("Footer", () => {
  it("có 3 cột link và email hỗ trợ, không có số điện thoại", () => {
    renderAt(<Footer />);
    expect(screen.getByRole("link", { name: "Câu hỏi thường gặp" })).toHaveAttribute("href", "/contact#faq");
    expect(screen.getByRole("link", { name: "Trở thành ban tổ chức" })).toHaveAttribute("href", "/become-organizer");
    expect(screen.getByRole("link", { name: /@/ })).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(screen.queryByText(/\d{4}[.\s]?\d{3,4}/)).toBeNull();
  });
});
