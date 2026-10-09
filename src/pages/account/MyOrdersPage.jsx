import { Link, useSearchParams } from "react-router-dom";
import { Receipt } from "lucide-react";
import { flattenPages, totalOf, useMyOrders } from "@/api";
import { AccountEmpty, AccountPageHeader, PillTabs } from "@/components/account";
import { ErrorState, InfiniteSentinel } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatNumber } from "@/lib/format";
import { OrderCard, OrderCardsSkeleton } from "./components/OrderCard";
import { ORDER_FILTERS, groupByMonth, orderFilterOf } from "./lib";

const PAGE_SIZE = 24;

const EMPTY = {
  all: { title: "Chưa có đơn hàng nào", description: "Đơn hàng xuất hiện ở đây ngay khi bạn đặt vé, kể cả đơn chưa thanh toán." },
  paid: { title: "Chưa có đơn thành công", description: "Đơn đã thanh toán xong sẽ nằm ở đây, kèm vé điện tử." },
  pending: { title: "Không có đơn đang xử lý", description: "Đơn đang chờ thanh toán hoặc đang đối soát sẽ hiện ở đây." },
  cancelled: { title: "Không có đơn đã hủy", description: "Đơn bị hủy hoặc hết hạn thanh toán sẽ được lưu lại ở đây." },
};

export default function MyOrdersPage() {
  useDocumentTitle("Đơn hàng");
  const [params, setParams] = useSearchParams();
  const filter = orderFilterOf(params.get("status"));
  const query = useMyOrders({ status: filter.status, size: PAGE_SIZE });
  const orders = flattenPages(query.data);
  const total = totalOf(query.data);
  const position = new Map(orders.map((o, i) => [o.id, i]));

  const changeFilter = (value) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setParams(next, { preventScrollReset: true });
  };
  const tabs = ORDER_FILTERS.map((f) => ({ ...f, count: f.value === filter.value && query.isSuccess && total > 0 ? total : null, countLabel: "đơn" }));

  let body;
  if (query.isPending) body = <OrderCardsSkeleton />;
  else if (query.isError) body = <ErrorState error={query.error} onRetry={query.refetch} />;
  else if (orders.length === 0) {
    const empty = EMPTY[filter.value];
    body = (
      <AccountEmpty
        icon={Receipt}
        title={empty.title}
        description={empty.description}
        action={
          filter.value === "all" ? (
            <Button asChild>
              <Link to="/events">Khám phá sự kiện</Link>
            </Button>
          ) : (
            <Button asChild variant="secondary">
              <Link to="/me/orders">Xem tất cả đơn</Link>
            </Button>
          )
        }
      />
    );
  } else
    body = (
      <div aria-label="Danh sách đơn hàng" role="region" className="space-y-6">
        {groupByMonth(orders).map((group) => (
          <section key={group.key} aria-labelledby={`orders-${group.key}`}>
            <h2
              id={`orders-${group.key}`}
              className="sticky top-(--header-h) z-10 -mx-1 mb-2 bg-page/95 px-1 py-2 text-sm font-bold text-foreground backdrop-blur-sm"
            >
              {group.label}
              <span className="ml-2 font-normal text-muted-foreground tabular-nums">{formatNumber(group.orders.length)} đơn</span>
            </h2>
            <ul className="space-y-3">
              {group.orders.map((order) => (
                <OrderCard key={order.id} order={order} index={position.get(order.id) % PAGE_SIZE} />
              ))}
            </ul>
          </section>
        ))}
        <InfiniteSentinel query={query} endLabel={total > PAGE_SIZE ? "Đã hiển thị tất cả đơn hàng" : null} />
      </div>
    );

  return (
    <>
      <AccountPageHeader
        icon={Receipt}
        title="Đơn hàng"
        description="Mới nhất ở trên. Mở một đơn để xem vé, thanh toán tiếp hoặc hủy đơn đang chờ."
      />
      <PillTabs label="Lọc đơn hàng" value={filter.value} onValueChange={changeFilter} items={tabs}>
        {body}
      </PillTabs>
    </>
  );
}
