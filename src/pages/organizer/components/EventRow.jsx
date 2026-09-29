// Từ md: lưới 6 cột (GRID, dùng chung với hàng tiêu đề của trang). Điện thoại: ảnh | nội dung | nút "…".

import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Rocket, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import { AnimatedItem } from "@/components/motion";
import { ImageWithFallback, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel } from "@/lib/constants";
import { formatDate, formatNumber, formatTime, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SoldMeter } from "./OrgUi";

export const GRID = "md:grid md:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_40px] md:items-center md:gap-6";

export const EventRow = memo(function EventRow({ event: e, index, onPublish, onDelete }) {
  const navigate = useNavigate();
  const isDraft = e.status === "DRAFT";
  const detail = `/organizer/events/${e.id}`;
  return (
    <AnimatedItem index={index} className={cn("group/row relative grid grid-cols-[88px_minmax(0,1fr)_32px] gap-x-4 gap-y-3 border-b border-border py-4 transition-colors hover:bg-background-2", GRID)}>
      <div className="contents md:flex md:min-w-0 md:items-center md:gap-4">
        <ImageWithFallback src={e.coverImageUrl} alt="" fallback={null} fallbackLabel={e.name} className="aspect-card w-22 shrink-0 md:w-18" />
        <div className="min-w-0">
          <Link to={detail} className="line-clamp-2 font-medium text-foreground transition-colors group-hover/row:text-primary after:absolute after:inset-0 focus-ring md:line-clamp-1">
            {e.name}
          </Link>
          <p className="mt-1 truncate text-meta text-muted-foreground">{[categoryLabel(e.category), e.venue?.city].filter(Boolean).join(", ") || "Chưa có danh mục"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-secondary-foreground md:hidden">
            <StatusBadge kind="event" status={e.status} />
            <span className="tabular-nums">{e.startsAt ? `${formatDate(e.startsAt)} ${formatTime(e.startsAt)}` : "Chưa có lịch"}</span>
          </div>
        </div>
      </div>

      <div className="hidden text-sm tabular-nums md:block">
        {e.startsAt ? (
          <>
            <p className="text-foreground">{formatDate(e.startsAt)}</p>
            <p className="text-meta text-muted-foreground">{formatTime(e.startsAt)}</p>
          </>
        ) : (
          <p className="text-disabled-foreground">Chưa có lịch</p>
        )}
      </div>

      <div className="hidden md:block">
        <StatusBadge kind="event" status={e.status} />
      </div>

      <div className="col-span-2 col-start-2 md:col-span-1 md:col-start-auto">
        <div className="flex items-baseline justify-between gap-2 text-meta tabular-nums md:block">
          <span className="text-foreground">
            {formatNumber(e.ticketsSold ?? 0)}
            <span className="text-muted-foreground"> / {formatNumber(e.ticketsTotal ?? 0)}</span>
          </span>
          <span className="text-secondary-foreground md:hidden">{formatVND(e.revenue ?? 0)}</span>
        </div>
        {e.ticketsSold ? (
          <SoldMeter className="mt-2 h-1 max-w-40 max-md:max-w-none" delay={Math.min(index, 9) * 0.035 + 0.1} sold={e.ticketsSold} total={e.ticketsTotal ?? 0} />
        ) : (
          <p className="mt-1.5 text-xs text-disabled-foreground">Chưa bán</p>
        )}
      </div>

      <p className="hidden text-right text-sm text-foreground tabular-nums md:block">{e.revenue ? formatVND(e.revenue) : <span className="text-disabled-foreground">0đ</span>}</p>

      <div className="relative z-10 col-start-3 row-start-1 flex justify-end md:col-start-auto md:row-start-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Thao tác cho ${e.name}`}>
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => navigate(detail)}>
              <Eye aria-hidden="true" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate(`${detail}/edit`)}>
              <Pencil aria-hidden="true" />
              Sửa
            </DropdownMenuItem>
            {!isDraft && e.slug ? (
              <DropdownMenuItem onSelect={() => navigate(`/events/${e.slug}`)}>
                <SquareArrowOutUpRight aria-hidden="true" />
                Trang công khai
              </DropdownMenuItem>
            ) : null}
            {isDraft ? (
              <>
                <DropdownMenuItem onSelect={() => onPublish(e)}>
                  <Rocket aria-hidden="true" />
                  Xuất bản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(e)}>
                  <Trash2 aria-hidden="true" />
                  Xóa bản nháp
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </AnimatedItem>
  );
});

export function EventRowsSkeleton({ rows = 6, as: Tag = "div" }) {
  return (
    <Tag role="status" aria-label="Đang tải">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={cn("grid grid-cols-[88px_1fr] gap-4 border-b border-border py-4", GRID)}>
          <div className="flex items-center gap-4">
            <Skeleton className="aspect-card w-22 shrink-0 rounded-none md:w-18" />
            <div className="w-full space-y-2 max-md:hidden">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          <div className="space-y-2 md:hidden">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="hidden h-4 w-20 md:block" />
          <Skeleton className="hidden h-4 w-16 md:block" />
          <Skeleton className="hidden h-3 w-28 md:block" />
          <Skeleton className="ml-auto hidden h-4 w-24 md:block" />
          <span className="hidden md:block" />
        </div>
      ))}
    </Tag>
  );
}
