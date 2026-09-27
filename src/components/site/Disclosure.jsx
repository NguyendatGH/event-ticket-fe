import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Khối thu gọn / mở rộng, mặc định tiêu đề "Thông tin giao dịch" (design-spec: chi tiết kỹ thuật
 * như mã giao dịch, cổng thanh toán được giấu dưới nhãn này để trang gọn).
 *   <Disclosure><PaymentDetails order={order} /></Disclosure>
 */
export function Disclosure({ title = "Thông tin giao dịch", defaultOpen = false, children, className }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("border-y border-border", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-medium text-secondary-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        {title}
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open ? <div className="pb-5">{children}</div> : null}
    </div>
  );
}
