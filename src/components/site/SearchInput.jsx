import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/components/ui/input";

/**
 * Ô tìm kiếm vuông vức (radius 4px, viền 1px). Controlled: value + onChange(string).
 * onSubmit(value) khi nhấn Enter (form role="search").
 */
export function SearchInput({ value = "", onChange, onSubmit, placeholder = "Tìm sự kiện, nhà tổ chức", label = "Tìm kiếm", size = "md", className, autoFocus, name = "q" }) {
  const id = useId();
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value.trim());
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id={id}
        name={name}
        type="search"
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(fieldClass, "w-full px-9 [&::-webkit-search-cancel-button]:hidden", size === "sm" ? "h-9" : "h-10")}
      />
      {value ? (
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => {
            onChange?.("");
            onSubmit?.("");
          }}
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
}
