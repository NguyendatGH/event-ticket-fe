import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "./SearchInput";

/**
 * Ô tìm kiếm "gõ xong mới tìm": giữ bản nháp riêng, sau `delay` ms không gõ nữa mới gọi onCommit
 * (thường là ghi ?q= lên URL). Enter thì commit ngay.
 *   <DebouncedSearch value={q} onCommit={(v) => setParam("q", v)} placeholder="Tìm theo tên sự kiện" />
 * Các prop còn lại (placeholder, label, size, className…) chuyển xuống <SearchInput>.
 *
 * Vì sao là component riêng (leaf): bản nháp nằm trong state của ô này, nên gõ phím chỉ render lại
 * chính ô tìm kiếm, không render lại cả trang (lưới thẻ, bộ lọc…). Đợt tối ưu trước đo được
 * số lần render khi gõ ở /events giảm ~80% nhờ việc này.
 */
export function DebouncedSearch({ value, onCommit, delay = 350, ...props }) {
  const [draft, setDraft] = useState(value);

  // `value` là từ khóa đã commit (đang nằm trên URL). Nếu nó đổi từ BÊN NGOÀI (nút "Xóa bộ lọc",
  // back/forward, ô tìm kiếm trên Header) thì bản nháp phải chạy theo.
  // Cách React khuyên: so với giá trị lần trước ngay khi render và setState luôn, không cần useEffect
  // (react.dev: "Adjusting some state when a prop changes").
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    // Chỉ ghi đè khi khác thật: đang gõ "rock " (có dấu cách cuối) mà URL là "rock" thì giữ nguyên.
    if (value !== draft.trim()) setDraft(value);
  }

  const debounced = useDebounce(draft, delay);
  useEffect(() => {
    if (debounced.trim() !== value) onCommit(debounced.trim());
    // Chỉ chạy khi từ khóa đã debounce đổi. Không đưa `value`/`onCommit` vào deps: trang thường tạo
    // onCommit mới mỗi lần render, và khi URL đổi từ ngoài thì không được commit lại bản nháp cũ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return <SearchInput value={draft} onChange={setDraft} onSubmit={onCommit} {...props} />;
}
