// Ô tìm kiếm "gõ xong mới tìm"; bản nháp giữ ở component lá nên gõ phím không render lại cả trang.

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "./SearchInput";

export function DebouncedSearch({ value, onCommit, delay = 350, ...props }) {
  const [draft, setDraft] = useState(value);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== draft.trim()) setDraft(value);
  }

  const debounced = useDebounce(draft, delay);
  useEffect(() => {
    if (debounced.trim() !== value) onCommit(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return <SearchInput value={draft} onChange={setDraft} onSubmit={onCommit} {...props} />;
}
