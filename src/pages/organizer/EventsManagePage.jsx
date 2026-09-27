/**
 * Trang "Quản lý sự kiện" của ban tổ chức — route /organizer/events?status=&q=
 * Tab trạng thái (kèm số đếm), tìm theo tên, danh sách sự kiện tải thêm theo trang.
 * Bản nháp: xuất bản (PublishEventDialog) hoặc xóa (có hộp xác nhận).
 * Dữ liệu: useInfiniteOrganizerEvents (GET /organizer/events), useDashboardSummary({}) chỉ để lấy số đếm cho tab,
 * useDeleteOrganizerEvent.
 */
import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { flattenPages, useDashboardSummary, useDeleteOrganizerEvent, useInfiniteOrganizerEvents } from "@/api";
import { AnimatedList, LayoutGroup, TabIndicator } from "@/components/motion";
import { ConfirmDialog, DebouncedSearch, EmptyState, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EventRow, EventRowsSkeleton, GRID } from "./components/EventRow";
import { LoadMore, OrgHeader } from "./components/OrgUi";
import { PublishEventDialog } from "./components/PublishEventDialog";

const PAGE_SIZE = 12;

/** Tab trạng thái: `value` gửi lên API (?status=), `countKey` là field số đếm trong summary.events. */
const EVENT_TABS = [
  { value: "", label: "Tất cả", countKey: "total" },
  { value: "DRAFT", label: "Bản nháp", countKey: "draft" },
  { value: "PUBLISHED", label: "Đang bán", countKey: "published" },
  { value: "UPCOMING", label: "Sắp mở bán", countKey: "upcoming" },
  { value: "ENDED", label: "Đã kết thúc", countKey: "ended" },
];

export default function EventsManagePage() {
  useDocumentTitle("Sự kiện");
  const [params, setParams] = useSearchParams();
  const status = EVENT_TABS.some((t) => t.value === params.get("status")) ? params.get("status") : "";
  const q = params.get("q") || "";
  const summary = useDashboardSummary({});
  const counts = summary.data?.events;

  /** Ghi một tham số lên URL (rỗng → xóa). Gõ tìm kiếm dùng replace để không đầy lịch sử Back. */
  const setParam = (key, value) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { preventScrollReset: true, replace: key === "q" }
    );

  const eventsQ = useInfiniteOrganizerEvents({ status, q, size: PAGE_SIZE });
  const rows = flattenPages(eventsQ.data);
  const total = eventsQ.data?.pages?.[0]?.totalElements;

  const [publishing, setPublishing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const remove = useDeleteOrganizerEvent();
  const tabGroup = useId();

  let content;
  if (eventsQ.isError) {
    content = <ErrorState error={eventsQ.error} onRetry={eventsQ.refetch} />;
  } else if (eventsQ.isPending) {
    content = <EventRowsSkeleton />;
  } else if (total === 0) {
    content = <EmptyList status={status} q={q} onClear={() => setParam("q", "")} />;
  } else {
    content = (
      <>
        <div className={cn("hidden border-b border-border py-3 text-xs font-medium tracking-caps text-muted-foreground uppercase", GRID)} aria-hidden="true">
          <span>Sự kiện</span>
          <span>Thời gian</span>
          <span>Trạng thái</span>
          <span>Đã bán</span>
          <span className="text-right">Doanh thu</span>
          <span />
        </div>
        {/* Đổi tab / từ khóa: danh sách cũ mờ đi (isPlaceholderData) trong lúc chờ kết quả mới. */}
        <AnimatedList aria-label="Danh sách sự kiện" className={cn("transition-opacity", eventsQ.isPlaceholderData && "opacity-60")}>
          {rows.map((e, i) => (
            <EventRow key={e.id} index={i % PAGE_SIZE} event={e} onPublish={setPublishing} onDelete={setDeleting} />
          ))}
          {eventsQ.isFetchingNextPage ? <EventRowsSkeleton key="more" as="li" rows={3} /> : null}
        </AnimatedList>
        <LoadMore query={eventsQ} className="py-8" />
      </>
    );
  }

  return (
    <div>
      <OrgHeader
        eyebrow="Sự kiện"
        title="Quản lý sự kiện"
        meta={total != null ? <span className="tabular-nums">{formatNumber(total)} sự kiện{status ? ` ${EVENT_TABS.find((t) => t.value === status).label.toLowerCase()}` : ""}</span> : null}
        className="border-b-0 pb-6 md:pb-8"
      />

      <div className="flex flex-col gap-4 border-b border-border md:flex-row md:items-end md:justify-between">
        {/* layoutScroll: hàng tab cuộn ngang trên điện thoại, vạch chọn vẫn tính đúng vị trí khi đã cuộn. */}
        <LayoutGroup id={tabGroup}>
          <motion.div layoutScroll role="tablist" aria-label="Trạng thái" className="-mb-px flex gap-6 overflow-x-auto no-scrollbar">
            {EVENT_TABS.map((t) => {
              const active = t.value === status;
              return (
                <button
                  key={t.value || "all"}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setParam("status", t.value)}
                  className={cn(
                    "relative flex shrink-0 cursor-pointer items-baseline gap-1.5 pb-3 text-sm font-medium whitespace-nowrap transition-colors focus-ring",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {counts?.[t.countKey] != null ? <span className={cn("text-xs tabular-nums transition-colors", active ? "text-muted-foreground" : "text-disabled-foreground")}>{formatNumber(counts[t.countKey])}</span> : null}
                  {active ? <TabIndicator id="events-status" /> : null}
                </button>
              );
            })}
          </motion.div>
        </LayoutGroup>
        <DebouncedSearch value={q} onCommit={(v) => setParam("q", v)} placeholder="Tìm theo tên sự kiện" label="Tìm sự kiện" size="sm" className="mb-3 w-full md:w-72" />
      </div>

      {content}

      {publishing ? <PublishEventDialog event={publishing} open onOpenChange={(o) => !o && setPublishing(null)} /> : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xóa bản nháp?"
        description={deleting ? `"${deleting.name}" sẽ bị xóa vĩnh viễn. Không thể hoàn tác.` : ""}
        confirmLabel="Xóa bản nháp"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Đã xóa bản nháp");
              setDeleting(null);
            },
            onError: (err) => {
              toast.error(err.message);
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}

/** Danh sách rỗng: 3 lời nhắn khác nhau khi đang tìm / đang lọc tab / chưa có sự kiện nào. */
function EmptyList({ status, q, onClear }) {
  if (q)
    return (
      <EmptyState
        title={`Không có sự kiện khớp "${q}"`}
        description="Thử từ khóa khác hoặc xóa tìm kiếm để xem toàn bộ sự kiện."
        action={
          <Button variant="secondary" onClick={onClear}>
            Xóa tìm kiếm
          </Button>
        }
      />
    );
  if (status)
    return (
      <EmptyState
        title="Không có sự kiện ở trạng thái này"
        description="Sự kiện sẽ xuất hiện ở đây khi chuyển sang trạng thái tương ứng."
        action={
          <Button asChild variant="secondary">
            <Link to="/organizer/events">Xem tất cả sự kiện</Link>
          </Button>
        }
      />
    );
  return (
    <EmptyState
      title="Chưa có sự kiện nào"
      description="Tạo sự kiện đầu tiên: nhập thông tin, thêm hạng vé, xem trước rồi xuất bản."
      action={
        <Button asChild size="lg">
          <Link to="/organizer/events/new">Tạo sự kiện đầu tiên</Link>
        </Button>
      }
    />
  );
}
