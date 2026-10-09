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

export function RefundStatusBadge({ refund, className }) {
  const [label, variant] = refundStatusBadge(refund);
  if (!label) return null;
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
