// Khối hoàn tiền trên trang đơn: lịch sử yêu cầu + nút tạo yêu cầu mới.
// Poll khi còn yêu cầu đang chạy vì tiền đi bất đồng bộ (BE trả 202).

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCreateRefund, useOrderRefunds } from "@/api";
import { normalizeError } from "@/api";
import { Notice, Price, RefundStatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { REFUND_FAILURE_LABEL } from "@/lib/constants";
import { RefundDialog } from "./RefundDialog";

const POLL_MS = 3000;
const REFUNDABLE_ORDER = ["PAID", "PARTIALLY_REFUNDED", "REFUND_FAILED"];
const OPEN_REFUND = ["REQUESTED", "AWAITING_FUNDS", "PROCESSING", "MANUAL_REVIEW"];

export function RefundSection({ order }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRun, setDialogRun] = useState(0);   // đổi key -> RefundDialog khởi tạo lại lựa chọn
  const [error, setError] = useState(null);

  const refundsQ = useOrderRefunds(order.id, {
    refetchInterval: (query) => (query.state.data?.some((r) => OPEN_REFUND.includes(r.status)) ? POLL_MS : false),
  });
  const refunds = refundsQ.data ?? [];

  const create = useCreateRefund(order.id, {
    onSuccess: (refund) => {
      setDialogOpen(false);
      setError(null);
      refundsQ.refetch();
      toast.success(
        refund.status === "MANUAL_REVIEW"
          ? "Đã gửi yêu cầu. Ban tổ chức sẽ duyệt rồi chuyển tiền."
          : "Đã gửi yêu cầu hoàn vé. Tiền sẽ về tài khoản bạn đã thanh toán."
      );
    },
    onError: (e) => setError(normalizeError(e).message),
  });

  const activeTickets = (order.tickets ?? []).filter((t) => t.status === "ACTIVE");
  const canRequest = REFUNDABLE_ORDER.includes(order.status) && activeTickets.length > 0;
  if (!canRequest && refunds.length === 0) return null;

  // Giá một vé chỉ suy được khi đơn chỉ có một hạng vé; nhiều hạng thì để BE tính, không đoán.
  const unitPrice = order.items?.length === 1 ? order.items[0].unitPrice : null;

  return (
    <section aria-labelledby="order-refunds" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="order-refunds" className="eyebrow">
          Hoàn vé
        </h2>
        {canRequest ? (
          <Button
            onClick={() => {
              setDialogRun((n) => n + 1);
              setDialogOpen(true);
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Yêu cầu hoàn vé
          </Button>
        ) : null}
      </div>

      {refunds.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {refunds.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">
                  {r.items?.length ?? 0} vé · <Price value={r.amount} size="sm" className="align-baseline" />
                </p>
                <p className="text-[12px] text-muted-foreground">{formatDateTime(r.createdAt)}</p>
                {r.failureCode ? (
                  <p className="text-[12px] text-muted-foreground">
                    {REFUND_FAILURE_LABEL[r.failureCode] ?? r.failureReason ?? r.failureCode}
                  </p>
                ) : null}
              </div>
              <RefundStatusBadge refund={r} />
            </li>
          ))}
        </ul>
      ) : null}

      {refunds.some((r) => r.status === "MANUAL_REVIEW") ? (
        <Notice title="Một yêu cầu đang chờ ban tổ chức duyệt.">
          Ban tổ chức sẽ kiểm tra tài khoản nhận rồi chuyển tiền và cập nhật trạng thái. Bạn không cần gửi thêm yêu cầu.
        </Notice>
      ) : null}

      <RefundDialog
        key={dialogRun}
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setError(null);
        }}
        tickets={order.tickets ?? []}
        payment={order.payment}
        customerEmail={order.customer?.email ?? ""}
        unitPrice={unitPrice}
        loading={create.isPending}
        error={error}
        // body dialog trả về: { ticketIds, reason, destination, contactEmail } — đúng body BE mong đợi.
        onSubmit={(body) => create.mutate({ body })}
      />
    </section>
  );
}
