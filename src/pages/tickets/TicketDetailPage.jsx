/**
 * Trang chi tiết một vé — route /me/tickets/:id (cần đăng nhập, nằm trong AccountLayout).
 * Vé điện tử (TicketCard: QR vào cổng + thông tin), tin bán lại đang có (đổi giá / gỡ tin qua ListingManager)
 * hoặc lời mời bán lại, lịch sử giao dịch (thu gọn).
 * Dữ liệu: useMyTicket(id) (GET /me/tickets/{id}).
 */
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Repeat2, Ticket } from "lucide-react";
import { useMyTicket } from "@/api";
import { AccountEmpty } from "@/components/account";
import { BackLink, Disclosure, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatVND } from "@/lib/format";
import { fadeUp, stagger } from "@/lib/motion";
import { ListingManager } from "./components/ListingManager";
import { TicketCard } from "./components/TicketCard";
import { TicketHistory } from "./components/TicketHistory";

export default function TicketDetailPage() {
  const { id } = useParams();
  const q = useMyTicket(id);
  const ticket = q.data;
  useDocumentTitle(ticket?.event?.name ? `Vé · ${ticket.event.name}` : "Chi tiết vé");

  let content;
  if (q.isPending) {
    content = <DetailSkeleton />;
  } else if (q.isError && q.error?.isNotFound) {
    content = (
      <AccountEmpty
        icon={Ticket}
        title="Không tìm thấy vé"
        description="Vé không thuộc tài khoản của bạn hoặc đã được chuyển nhượng cho người khác."
        action={
          <Button asChild>
            <Link to="/me/tickets">Về vé của tôi</Link>
          </Button>
        }
      />
    );
  } else if (q.isError) {
    content = <ErrorState error={q.error} onRetry={q.refetch} />;
  } else {
    content = <TicketDetail ticket={ticket} />;
  }

  return (
    <>
      <div className="mb-4">
        <BackLink to="/me/tickets">Vé của tôi</BackLink>
      </div>
      {content}
    </>
  );
}

function TicketDetail({ ticket }) {
  const { listing } = ticket;
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={fadeUp}>
        <TicketCard ticket={ticket} />
      </motion.div>

      {listing ? (
        <motion.div variants={fadeUp}>
          <ListingManager ticket={ticket} />
        </motion.div>
      ) : null}

      {!listing && ticket.resellable ? (
        <motion.section
          variants={fadeUp}
          aria-labelledby="resell-title"
          className="flex flex-col gap-5 rounded-card bg-card p-5 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between md:px-7"
        >
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/30" aria-hidden="true">
              <Repeat2 className="size-5" />
            </span>
            <div>
              <h2 id="resell-title" className="text-lg font-bold text-foreground">
                Không đi được nữa?
              </h2>
              <p className="mt-1 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
                Đăng bán lại trên chợ vé với giá tối đa <span className="font-semibold text-foreground tabular-nums">{formatVND(ticket.maxResalePrice)}</span>. Khi có
                người mua, vé được chuyển cho họ kèm mã QR mới.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link to={`/me/tickets/${ticket.id}/resell`}>Bán lại vé này</Link>
          </Button>
        </motion.section>
      ) : null}

      <motion.div variants={fadeUp} className="rounded-card bg-card px-5 ring-1 ring-white/5 md:px-7">
        <Disclosure title="Thông tin giao dịch" className="border-0">
          <TicketHistory items={ticket.history || []} />
        </Disclosure>
      </motion.div>
    </motion.div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Đang tải vé">
      <div className="grid overflow-hidden rounded-card bg-card ring-1 ring-white/5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4 p-5 lg:p-0">
          <Skeleton className="hidden aspect-video w-full rounded-none lg:block" />
          <div className="space-y-3 lg:px-7 lg:pb-7">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="grid place-items-center p-7">
          <Skeleton className="size-56" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-card" />
    </div>
  );
}
