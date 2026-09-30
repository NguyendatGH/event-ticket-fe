// Nhãn trạng thái tiếng Việt cho enum BE. kind: event | order | payment | ticket | refund.

import { Badge } from "@/components/ui/badge";
import { STATUS, refundStatusBadge } from "@/lib/constants";

export function StatusBadge({ kind, status, className }) {
  if (!status) return null;
  const [label, variant] = STATUS[kind]?.[status] || [status, "outline"];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

/**
 * Badge cho một yêu cầu hoàn tiền. Dùng cái này thay cho <StatusBadge kind="refund" status={...} />
 * ở mọi nơi có cả object refund: refund bị BTC hủy vẫn có status = "FAILED", nhãn phải là
 * "Đã hủy" chứ không phải "Hoàn tiền thất bại" (xem refundStatusBadge trong lib/constants).
 */
export function RefundStatusBadge({ refund, className }) {
  const [label, variant] = refundStatusBadge(refund);
  if (!label) return null;
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
