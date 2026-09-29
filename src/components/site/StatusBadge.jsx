// Nhãn trạng thái tiếng Việt cho enum BE. kind: event | order | payment | ticket.

import { Badge } from "@/components/ui/badge";
import { STATUS } from "@/lib/constants";

export function StatusBadge({ kind, status, className }) {
  if (!status) return null;
  const [label, variant] = STATUS[kind]?.[status] || [status, "outline"];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
