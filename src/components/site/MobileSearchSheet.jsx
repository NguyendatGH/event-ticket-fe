import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { HeaderSearch } from "./HeaderSearch";

/**
 * Ô tìm kiếm trên màn hình nhỏ (< lg): nút kính lúp ở Header mở Sheet trượt từ trên, nền xanh header,
 * ô tìm trắng tự focus. Enter → onSearch(từ khóa) (Header đóng Sheet và chuyển tới /events?q=). Chỉ dùng trong Header.jsx.
 */
export function MobileSearchSheet({ open, onOpenChange, onSearch }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="gap-0 border-none bg-header px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4 text-white [&>button]:text-white">
        <SheetTitle className="mb-3 text-sm font-semibold text-white">Tìm kiếm sự kiện</SheetTitle>
        <SheetDescription className="sr-only">Nhập tên sự kiện rồi nhấn Enter</SheetDescription>
        {open ? <HeaderSearch variant="shell" onSearch={onSearch} autoFocus className="w-full" /> : null}
      </SheetContent>
    </Sheet>
  );
}
