// Bản nháp giữ trong component lá này nên gõ phím không render lại cả Header.

import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { SearchInput } from "./SearchInput";
import { ShellSearch } from "./ShellSearch";

export function HeaderSearch({ onSearch, variant = "default", ...props }) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const currentQ = pathname === "/events" ? searchParams.get("q") || "" : "";
  const [draft, setDraft] = useState(currentQ);

  const [prevQ, setPrevQ] = useState(currentQ);
  if (currentQ !== prevQ) {
    setPrevQ(currentQ);
    setDraft(currentQ);
  }

  const Input = variant === "shell" ? ShellSearch : SearchInput;
  return <Input value={draft} onChange={setDraft} onSubmit={onSearch} placeholder="Tìm sự kiện" {...props} />;
}
