// Ô "Hoàn tiền" ở trang Tổng quan: chỗ duy nhất BTC THẤY có yêu cầu hoàn vé đang chờ mình,
// không cần ai nhắc. Badge đếm số yêu cầu MANUAL_REVIEW + AWAITING_FUNDS.

import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useOrganizerRefunds } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { countRefundsNeedingAction } from "../lib";

export function RefundsInboxLink() {
  // Cùng query key với trang Hoàn tiền nên vào trang đó là có dữ liệu ngay, không gọi lại.
  const { data } = useOrganizerRefunds();
  const count = countRefundsNeedingAction(data);

  return (
    <Button asChild variant="secondary">
      <Link to="/organizer/refunds">
        <RotateCcw aria-hidden="true" />
        Hoàn tiền
        {/* 0 thì nhạt để không làm BTC lo; >0 thì tone warning để bắt mắt. */}
        <Badge variant={count > 0 ? "warning" : "muted"}>
          {formatNumber(count)}
          <span className="sr-only">yêu cầu cần xử lý</span>
        </Badge>
      </Link>
    </Button>
  );
}
