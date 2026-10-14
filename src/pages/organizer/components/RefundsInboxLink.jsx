import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useOrganizerRefunds } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { countRefundsNeedingAction } from "../lib";

export function RefundsInboxLink() {
  const { data } = useOrganizerRefunds();
  const count = countRefundsNeedingAction(data);

  return (
    <Button asChild variant="secondary">
      <Link to="/organizer/refunds">
        <RotateCcw aria-hidden="true" />
        Hoàn tiền
        <Badge variant={count > 0 ? "warning" : "muted"}>
          {formatNumber(count)}
          <span className="sr-only">yêu cầu cần xử lý</span>
        </Badge>
      </Link>
    </Button>
  );
}
