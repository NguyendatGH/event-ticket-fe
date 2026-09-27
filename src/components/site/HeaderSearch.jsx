import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { SearchInput } from "./SearchInput";
import { ShellSearch } from "./ShellSearch";

/**
 * Ô tìm kiếm của Header (desktop, ô tìm mobile, menu mobile). Enter → onSearch(từ khóa) → Header chuyển tới /events?q=.
 * variant="shell": ô trắng có nút "Tìm kiếm" (trên nền xanh); mặc định: SearchInput tối (trong Sheet).
 * Bản nháp giữ trong component lá này nên gõ phím không render lại cả Header.
 */
export function HeaderSearch({ onSearch, variant = "default", ...props }) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  // Đang ở /events thì ô hiện từ khóa ?q= hiện tại; trang khác thì để trống.
  const currentQ = pathname === "/events" ? searchParams.get("q") || "" : "";
  const [draft, setDraft] = useState(currentQ);

  // URL đổi (sang trang khác, bấm back…) → đặt lại bản nháp theo URL. Làm ngay khi render,
  // không cần useEffect (react.dev: "Adjusting some state when a prop changes").
  const [prevQ, setPrevQ] = useState(currentQ);
  if (currentQ !== prevQ) {
    setPrevQ(currentQ);
    setDraft(currentQ);
  }

  const Input = variant === "shell" ? ShellSearch : SearchInput;
  return <Input value={draft} onChange={setDraft} onSubmit={onSearch} placeholder="Tìm sự kiện" {...props} />;
}
