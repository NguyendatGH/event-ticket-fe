// Một đơn trong /me/orders, cả thẻ là link tới /orders/:id. Ô lịch = ngày đặt.

import { memo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AnimatedItem } from "@/components/motion";
import { StatusBadge } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatTime, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { dateTile, ticketCount } from "../lib";

const DIMMED = new Set(["CANCELLED", "EXPIRED"]);

export const OrderCard = memo(function OrderCard({ order, index = 0 }) {
  const qty = ticketCount(order);
  const dimmed = DIMMED.has(order.status);
  const tile = dateTile(order.createdAt);
  return (
    <AnimatedItem index={index}>
      <Link
        to={`/orders/${order.id}`}
        className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-0.5 rounded-card bg-card p-3.5 ring-1 ring-white/5 transition-[box-shadow,transform,background-color] duration-300 ease-out-quint hover:-translate-y-0.5 hover:bg-elevated/60 hover:ring-primary/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-4 sm:p-4"
      >
        <span
          aria-hidden="true"
          className={cn(
            "row-span-3 flex w-13 flex-col items-center justify-center self-stretch rounded-lg py-2 sm:w-15",
            dimmed ? "bg-page/70 text-muted-foreground" : "bg-primary/10 text-primary ring-1 ring-primary/25"
          )}
        >
          <span className="text-xl leading-none font-bold tabular-nums sm:text-2xl">{tile?.day}</span>
          <span className="mt-1 text-2xs font-semibold uppercase">{tile?.month}</span>
        </span>

        <span className="col-start-2 row-start-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <code className="text-xs text-muted-foreground">#{order.orderCode}</code>
        </span>
        <span className="col-start-3 row-start-1 justify-self-end">
          <StatusBadge kind="order" status={order.status} />
        </span>

        <span
          className={cn(
            "col-span-2 col-start-2 row-start-2 truncate text-base font-bold text-foreground transition-colors group-hover:text-primary",
            dimmed && "text-muted-foreground"
          )}
        >
          {order.eventName}
        </span>

        <span className="col-start-2 row-start-3 text-sm text-muted-foreground tabular-nums">
          {formatTime(order.createdAt)} · {formatNumber(qty)} vé
        </span>
        <span
          className={cn(
            "col-start-3 row-start-3 justify-self-end text-base font-bold text-foreground tabular-nums",
            dimmed && "text-muted-foreground line-through decoration-1"
          )}
        >
          {formatVND(order.totalAmount)}
        </span>

        <ChevronRight
          className="col-start-4 row-span-3 row-start-1 hidden size-5 text-muted-foreground transition-[color,translate] duration-200 ease-out-quint group-hover:translate-x-0.5 group-hover:text-primary sm:block"
          aria-hidden="true"
        />
      </Link>
    </AnimatedItem>
  );
});

export function OrderCardsSkeleton({ rows = 5 }) {
  return (
    <div role="status" aria-label="Đang tải đơn hàng" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-card bg-card p-4 ring-1 ring-white/5">
          <Skeleton className="h-16 w-15 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="ml-auto h-5 w-24" />
            <Skeleton className="ml-auto h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
