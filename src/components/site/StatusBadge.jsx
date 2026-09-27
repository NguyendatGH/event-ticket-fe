import { Badge } from "@/components/ui/badge";
import { STATUS } from "@/lib/constants";

/**
 * Nhãn trạng thái tiếng Việt cho enum BE.
 *   <StatusBadge kind="event" status="PUBLISHED" />   // ĐANG BÁN
 * kind: event | order | payment | ticket | listing | orderKind
 */
export function StatusBadge({ kind, status, className }) {
  if (!status) return null;
  const [label, variant] = STATUS[kind]?.[status] || [status, "outline"];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
