import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Nút gửi form có trạng thái đang xử lý (vòng quay + khóa nút để không gửi 2 lần).
 *   <SubmitButton pending={mutation.isPending} pendingLabel="Đang lưu…">Lưu</SubmitButton>
 */
export function SubmitButton({ pending, children, pendingLabel, className, ...props }) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending || undefined} className={className} {...props}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel || children : children}
    </Button>
  );
}
