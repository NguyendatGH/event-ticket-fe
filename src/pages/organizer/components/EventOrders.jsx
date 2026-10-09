import { useSearchParams } from "react-router-dom";
import { flattenPages, useInfiniteOrganizerEventOrders } from "@/api";
import { DebouncedSearch, EmptyState, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EventOrderItem, EventOrderRow } from "./EventOrderRow";
import { BlockTitle, LoadMore, NativeSelect, TH, TH_ROW } from "./OrgUi";

const ORDER_PAGE = 20;
const ORDER_STATUSES = [
  { value: "", label: "Mọi trạng thái" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "MANUAL_REVIEW", label: "Đang đối soát" },
];

export function EventOrders({ eventId, isDraft }) {
  const [params, setParams] = useSearchParams();
  const status = params.get("orderStatus") || "";
  const q = params.get("oq") || "";

  const setFilters = (patch) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
        return next;
      },
      { preventScrollReset: true, replace: true }
    );

  const ordersQ = useInfiniteOrganizerEventOrders(eventId, { status, q, size: ORDER_PAGE });
  const rows = flattenPages(ordersQ.data);
  const total = ordersQ.data?.pages?.[0]?.totalElements;

  let content;
  if (ordersQ.isError) {
    content = <ErrorState compact error={ordersQ.error} onRetry={ordersQ.refetch} />;
  } else if (ordersQ.isPending) {
    content = <OrdersSkeleton />;
  } else if (total === 0 && (status || q)) {
    content = (
      <EmptyState
        className="py-12 md:py-14"
        title="Không có đơn khớp bộ lọc"
        description="Thử trạng thái khác hoặc xóa từ khóa."
        action={
          <Button variant="secondary" onClick={() => setFilters({ orderStatus: "", oq: "" })}>
            Xóa bộ lọc
          </Button>
        }
      />
    );
  } else if (total === 0) {
    content = (
      <EmptyState
        className="py-12 md:py-14"
        title="Chưa có đơn hàng"
        description={isDraft ? "Xuất bản sự kiện để bắt đầu bán vé. Đơn hàng sẽ hiện ở đây." : "Đơn hàng sẽ hiện ở đây ngay khi khách đặt vé."}
      />
    );
  } else {
    content = (
      <div className={cn("transition-opacity", ordersQ.isPlaceholderData && "opacity-60")}>
        <ul aria-label="Đơn hàng" className="border-t border-border md:hidden">
          {rows.map((o, i) => (
            <EventOrderItem key={o.id} index={i % ORDER_PAGE} order={o} />
          ))}
        </ul>
        <div className="overflow-x-auto max-md:hidden">
          <table className="w-full min-w-190 text-sm">
            <thead>
              <tr className={TH_ROW}>
                <th scope="col" className={TH}>Mã đơn</th>
                <th scope="col" className={TH}>Khách hàng</th>
                <th scope="col" className={cn(TH, "w-20 text-center")}>Số vé</th>
                <th scope="col" className={cn(TH, "w-36 pl-6 text-right")}>Tổng tiền</th>
                <th scope="col" className={cn(TH, "pl-8")}>Trạng thái</th>
                <th scope="col" className={cn(TH, "pl-6 text-right")}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o, i) => (
                <EventOrderRow key={o.id} index={i % ORDER_PAGE} order={o} />
              ))}
              {ordersQ.isFetchingNextPage
                ? Array.from({ length: 3 }, (_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-border" aria-hidden="true">
                      <td colSpan={6} className="py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <BlockTitle id="orders-title" title="Đơn hàng">
        {total != null ? <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(total)} đơn</span> : null}
      </BlockTitle>
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="order-status" className="sr-only">
          Lọc trạng thái đơn
        </label>
        <NativeSelect id="order-status" value={status} onChange={(e) => setFilters({ orderStatus: e.target.value })} className="h-9 sm:w-52">
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
        <DebouncedSearch
          value={q}
          onCommit={(v) => setFilters({ oq: v })}
          placeholder="Mã đơn, email hoặc tên khách"
          label="Tìm đơn hàng"
          size="sm"
          className="sm:w-80"
        />
      </div>

      {content}
      {total ? <LoadMore query={ordersQ} label="Tải thêm đơn" className="py-6" /> : null}
    </>
  );
}

function OrdersSkeleton() {
  return (
    <div role="status" aria-label="Đang tải đơn hàng">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_2fr_1fr] gap-6 border-b border-border py-4 md:grid-cols-[1fr_2fr_0.5fr_1fr_1fr_1fr]"
        >
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="ml-auto h-4 w-8 max-md:hidden" />
          <Skeleton className="ml-auto h-4 w-24 max-md:hidden" />
          <Skeleton className="h-4 w-20 max-md:hidden" />
          <Skeleton className="ml-auto h-4 w-28" />
        </div>
      ))}
    </div>
  );
}
