// Một yêu cầu hoàn tiền trong trang Hoàn tiền, 2 kiểu hiển thị cùng dữ liệu:
// RefundRow = <tr> cho màn rộng, RefundItem = <li> cho màn hẹp (giống cặp EventOrderRow/EventOrderItem).

import { motion } from "motion/react";
import { RefundStatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { refundReasonForOrganizer } from "@/lib/constants";
import { formatDateTime, formatNumber, formatVND } from "@/lib/format";
import { rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { refundCancelBlocker } from "../lib";
import { ROW } from "./OrgUi";

const rowIn = (index) => ({
  initial: rowItem.initial,
  animate: { ...rowItem.animate, transition: { ...rowItem.animate.transition, delay: Math.min(index, 9) * 0.03 } },
});

/**
 * BE chỉ trả orderId (UUID), chưa trả mã đơn ngắn, nên hiện 6 ký tự cuối cho dễ đối chiếu
 * và để id đầy đủ trong title + sr-only cho người dùng screen reader / copy tay.
 */
function OrderRef({ orderId }) {
  const id = String(orderId ?? "");
  return (
    <code title={id}>
      <span aria-hidden="true">#…{id.slice(-6)}</span>
      <span className="sr-only">Đơn {id}</span>
    </code>
  );
}

/** Tài khoản nhận tiền: BE đã che, chỉ còn 4 số cuối. */
function Destination({ refund: r, bankName }) {
  return (
    <>
      <p className="text-foreground tabular-nums">{r.destinationAccountMasked || "Chưa có số tài khoản"}</p>
      <p className="text-meta text-muted-foreground">
        {[bankName || r.destinationBin, r.destinationIsPayer === false ? "khác tài khoản đã thanh toán" : null]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </>
  );
}

/**
 * Việc BTC làm được với một yêu cầu, gom vào một chỗ cho bảng và danh sách dùng chung:
 * - "Xử lý" (mở hướng dẫn chuyển khoản tay) chỉ có nghĩa với MANUAL_REVIEW.
 * - "Hủy hoàn tiền" có với cả MANUAL_REVIEW và AWAITING_FUNDS, trừ khi cổng đã nhận lệnh chi.
 * Trạng thái không làm được gì thì ô hành động để trống, không hiện nút chết.
 */
function RowActions({ refund: r, onResolve, onCancel, className }) {
  const canResolve = r.status === "MANUAL_REVIEW";
  const blocker = refundCancelBlocker(r);
  if (!canResolve && blocker === "status") return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2 md:justify-end", className)}>
      {canResolve ? (
        <Button variant="secondary" size="sm" onClick={() => onResolve(r)}>
          Xử lý
        </Button>
      ) : null}
      {blocker === null ? (
        <Button variant="destructive" size="sm" onClick={() => onCancel(r)}>
          Hủy hoàn tiền
        </Button>
      ) : null}
      {blocker === "provider" ? (
        <p className="max-w-[32ch] text-meta leading-snug text-muted-foreground md:text-right">
          Cổng đã nhận lệnh chi nên không hủy được. Tra dashboard PayOS xem tiền đã đi chưa rồi chốt kết quả.
        </p>
      ) : null}
    </div>
  );
}

export function RefundRow({ refund: r, bankName, onResolve, onCancel, index = 0 }) {
  const reason = refundReasonForOrganizer(r);
  return (
    <motion.tr {...rowIn(index)} className={ROW}>
      <td className="py-3.5 pr-6 whitespace-nowrap text-muted-foreground tabular-nums">
        <OrderRef orderId={r.orderId} />
      </td>
      <td className="py-3.5 pr-6">
        <Destination refund={r} bankName={bankName} />
      </td>
      <td className="py-3.5 text-center text-foreground tabular-nums">{formatNumber(r.items?.length ?? 0)}</td>
      <td className="py-3.5 pl-6 text-right whitespace-nowrap text-foreground tabular-nums">{formatVND(r.amount)}</td>
      <td className="py-3.5 pl-8">
        <RefundStatusBadge refund={r} />
        {reason ? <p className="mt-1 max-w-[42ch] text-meta leading-snug text-muted-foreground">{reason}</p> : null}
      </td>
      <td className="py-3.5 pl-6 text-right whitespace-nowrap text-secondary-foreground tabular-nums">
        {formatDateTime(r.createdAt)}
      </td>
      <td className="py-3.5 pl-6 text-right">
        <RowActions refund={r} onResolve={onResolve} onCancel={onCancel} />
      </td>
    </motion.tr>
  );
}

export function RefundItem({ refund: r, bankName, onResolve, onCancel, index = 0 }) {
  const reason = refundReasonForOrganizer(r);
  return (
    <motion.li {...rowIn(index)} className="border-b border-border py-4">
      <div className="flex items-baseline justify-between gap-3">
        <RefundStatusBadge refund={r} />
        <p className="shrink-0 font-medium text-foreground tabular-nums">{formatVND(r.amount)}</p>
      </div>
      <div className="mt-2">
        <Destination refund={r} bankName={bankName} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta text-secondary-foreground tabular-nums">
        <OrderRef orderId={r.orderId} />
        <span>{formatNumber(r.items?.length ?? 0)} vé</span>
        <span>{formatDateTime(r.createdAt)}</span>
      </div>
      {reason ? <p className="mt-1.5 text-meta leading-snug text-muted-foreground">{reason}</p> : null}
      <RowActions refund={r} onResolve={onResolve} onCancel={onCancel} className="mt-3" />
    </motion.li>
  );
}
