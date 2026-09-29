// Bộ lọc dưới lg: ngăn trượt chứa cùng FilterPanel như cột trái desktop.

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatNumber } from "@/lib/format";
import { FilterPanel } from "./FilterPanel";

export function FilterSheet({
  open,
  onOpenChange,
  panelProps,
  activeCount,
  total,
  loading,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="max-sm:flex-1 lg:hidden">
          <SlidersHorizontal aria-hidden="true" />
          Bộ lọc
          {activeCount ? (
            <span className="ml-0.5 rounded-sm bg-primary px-1.5 text-2xs leading-5 text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-5 py-5">
          <SheetTitle>Bộ lọc</SheetTitle>
          <SheetDescription className="sr-only">
            Lọc sự kiện theo danh mục, thành phố, thời gian và giá
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 pt-2">
          <FilterPanel
            {...panelProps}
            className="[&>div:first-child]:hidden"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-5">
          <Button
            variant="secondary"
            onClick={panelProps.onReset}
            disabled={!panelProps.hasActive}
          >
            Xóa bộ lọc
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Xem {loading ? "" : formatNumber(total)} kết quả
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
