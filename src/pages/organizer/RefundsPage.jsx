import { useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { useAppConfig, useOrganizerRefunds } from "@/api";
import { LayoutGroup, TabIndicator } from "@/components/motion";
import { EmptyState, ErrorState, Notice } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatNumber } from "@/lib/format";
import { statusLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CancelRefundDialog } from "./components/CancelRefundDialog";
import { RefundInstructionDialog } from "./components/RefundInstructionDialog";
import { RefundItem, RefundRow } from "./components/RefundRow";
import { OrgHeader, TH, TH_ROW } from "./components/OrgUi";
import { REFUND_NEEDS_ACTION, countRefunds } from "./lib";

const SINGLE_TABS = ["MANUAL_REVIEW", "AWAITING_FUNDS", "REQUESTED", "PROCESSING", "SUCCEEDED", "FAILED"];
const TABS = [
  { value: "", label: "Cần xử lý", statuses: REFUND_NEEDS_ACTION },
  { value: "ALL", label: "Tất cả", statuses: null },
  ...SINGLE_TABS.map((s) => ({ value: s, label: statusLabel("refund", s), statuses: [s] })),
];

export default function RefundsPage() {
  useDocumentTitle("Hoàn tiền");
  const [params, setParams] = useSearchParams();
  const raw = params.get("status") || "";
  const tab = TABS.find((t) => t.value === raw) ?? TABS[0];
  const [resolving, setResolving] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const tabGroup = useId();

  const setParam = (value) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set("status", value);
        else next.delete("status");
        return next;
      },
      { preventScrollReset: true }
    );

  const query = useOrganizerRefunds();
  const all = query.data ?? [];
  const rows = tab.statuses ? all.filter((r) => tab.statuses.includes(r.status)) : all;


  const { banks = [] } = useAppConfig();
  const bankName = (bin) => banks.find((b) => b.bin === bin)?.name;

  const awaitingFunds = countRefunds(all, ["AWAITING_FUNDS"]);
  const needsAction = countRefunds(all, REFUND_NEEDS_ACTION);



  let content;
  if (query.isError) {
    content = <ErrorState error={query.error} onRetry={query.refetch} />;
  } else if (query.isPending) {
    content = <RefundsSkeleton />;
  } else if (rows.length === 0) {
    content = <EmptyRefunds tab={tab} onShowAll={() => setParam("ALL")} />;
  } else {
    content = (
      <div>
        <ul aria-label="Yêu cầu hoàn tiền" className="border-t border-border md:hidden">
          {rows.map((r, i) => (
            <RefundItem
              key={r.id}
              index={i}
              refund={r}
              bankName={bankName(r.destinationBin)}
              onResolve={setResolving}
              onCancel={setCancelling}
            />
          ))}
        </ul>
        <div className="overflow-x-auto max-md:hidden">
          <table className="w-full min-w-250 text-sm">
            <thead>
              <tr className={TH_ROW}>
                <th scope="col" className={TH}>Đơn hàng</th>
                <th scope="col" className={TH}>Tài khoản nhận</th>
                <th scope="col" className={cn(TH, "w-20 text-center")}>Số vé</th>
                <th scope="col" className={cn(TH, "w-36 pl-6 text-right")}>Số tiền</th>
                <th scope="col" className={cn(TH, "pl-8")}>Trạng thái</th>
                <th scope="col" className={cn(TH, "pl-6 text-right")}>Thời điểm</th>
                <th scope="col" className={cn(TH, "pl-6 text-right")}>
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <RefundRow
                  key={r.id}
                  index={i}
                  refund={r}
                  bankName={bankName(r.destinationBin)}
                  onResolve={setResolving}
                  onCancel={setCancelling}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OrgHeader
        eyebrow="Ban tổ chức"
        title="Hoàn tiền"
        meta={
          query.data ? (
            <span className="tabular-nums">
              {formatNumber(all.length)} yêu cầu
              {needsAction > 0 ? ` · ${formatNumber(needsAction)} cần bạn xử lý` : " · không có việc cần xử lý"}
            </span>
          ) : null
        }
        className="border-b-0 pb-6 md:pb-8"
      />

      <LayoutGroup id={tabGroup}>
        <motion.div
          layoutScroll
          role="tablist"
          aria-label="Trạng thái hoàn tiền"
          className="flex gap-6 overflow-x-auto border-b border-border no-scrollbar"
        >
          {TABS.map((t) => {
            const active = t.value === tab.value;
            const count = t.statuses ? countRefunds(all, t.statuses) : all.length;
            return (
              <button
                key={t.value || "needs-action"}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setParam(t.value)}
                className={cn(
                  "relative flex shrink-0 cursor-pointer items-baseline gap-1.5 pb-3 text-sm font-medium whitespace-nowrap transition-colors focus-ring",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {query.data ? (
                  <span className={cn("text-xs tabular-nums transition-colors", active ? "text-muted-foreground" : "text-disabled-foreground")}>
                    {formatNumber(count)}
                  </span>
                ) : null}
                {active ? <TabIndicator id="refund-status" /> : null}
              </button>
            );
          })}
        </motion.div>
      </LayoutGroup>

      {awaitingFunds > 0 ? (
        <Notice tone="warning" title={`${formatNumber(awaitingFunds)} yêu cầu đang chờ nguồn tiền`} className="mt-6">
          Ví chi của cổng thanh toán không đủ tiền để hoàn cho khách. Hãy nạp thêm tiền vào ví chi — hệ thống tự gửi lại
          lệnh ngay khi đủ, bạn không phải bấm gì. Nếu quá 24 giờ vẫn chưa đủ, yêu cầu sẽ chuyển sang “Chờ duyệt thủ
          công” và bạn phải chuyển khoản tay.
        </Notice>
      ) : null}

      <div className="mt-6">{content}</div>

      {resolving ? (
        <RefundInstructionDialog
          refund={resolving}
          open
          onOpenChange={(o) => !o && setResolving(null)}
          onResolved={() => setResolving(null)}
        />
      ) : null}

      {cancelling ? (
        <CancelRefundDialog
          refund={cancelling}
          open
          onOpenChange={(o) => !o && setCancelling(null)}
          onCancelled={() => setCancelling(null)}
        />
      ) : null}
    </div>
  );
}

function EmptyRefunds({ tab, onShowAll }) {
  if (!tab.value)
    return (
      <EmptyState
        title="Không có yêu cầu nào cần bạn xử lý"
        description="Yêu cầu hoàn vé của khách được hệ thống chi tự động. Chỉ khi ví chi thiếu tiền hoặc phải chuyển khoản tay thì nó mới hiện ở đây."
        action={
          <Button variant="secondary" onClick={onShowAll}>
            Xem tất cả yêu cầu
          </Button>
        }
      />
    );
  if (tab.statuses)
    return (
      <EmptyState
        title={`Không có yêu cầu ở trạng thái “${tab.label}”`}
        description="Yêu cầu sẽ xuất hiện ở đây khi chuyển sang trạng thái tương ứng."
        action={
          <Button variant="secondary" onClick={onShowAll}>
            Xem tất cả yêu cầu
          </Button>
        }
      />
    );
  return (
    <EmptyState
      title="Chưa có yêu cầu hoàn tiền nào"
      description="Khi khách xin hoàn vé, yêu cầu sẽ hiện ở đây kèm trạng thái chuyển tiền."
    />
  );
}

function RefundsSkeleton() {
  return (
    <div role="status" aria-label="Đang tải yêu cầu hoàn tiền">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr] gap-6 border-b border-border py-4 md:grid-cols-[1fr_1.5fr_0.5fr_1fr_1fr_1fr]">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="ml-auto h-4 w-8 max-md:hidden" />
          <Skeleton className="ml-auto h-4 w-24 max-md:hidden" />
          <Skeleton className="h-4 w-20 max-md:hidden" />
          <Skeleton className="ml-auto h-4 w-28 max-md:hidden" />
        </div>
      ))}
    </div>
  );
}
