import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ô tìm kiếm trắng trên header xanh (design-spec v2): kính lúp · ô nhập · | · nút "Tìm kiếm" nằm trong ô.
 * Controlled giống SearchInput: value + onChange(string), onSubmit(value đã trim) khi Enter hoặc bấm nút.
 * Chỉ dùng qua HeaderSearch variant="shell" (bản nháp giữ ở đó để gõ phím không render lại Header).
 */
export function ShellSearch({ value = "", onChange, onSubmit, placeholder = "Tìm sự kiện", label = "Tìm kiếm sự kiện", className, autoFocus }) {
  const id = useId();
  return (
    <form
      role="search"
      className={cn(
        "flex h-10 items-center rounded-md bg-white pr-1 pl-3 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
        "outline-offset-2 focus-within:outline-2 focus-within:outline-white",
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value.trim());
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="size-4.5 shrink-0 text-zinc-500" aria-hidden="true" />
      <input
        id={id}
        name="q"
        type="search"
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => onChange?.("")}
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-sm text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-header"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-zinc-300" />
      <button
        type="submit"
        className="h-8 shrink-0 cursor-pointer rounded-sm px-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-header focus-visible:outline-2 focus-visible:outline-header"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
