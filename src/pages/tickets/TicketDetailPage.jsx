import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Ticket } from "lucide-react";
import { useMyTicket } from "@/api";
import { AccountEmpty } from "@/components/account";
import { BackLink, Disclosure, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { fadeUp, stagger } from "@/lib/motion";
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
        description="Vé không tồn tại hoặc không thuộc tài khoản của bạn."
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
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={fadeUp}>
        <TicketCard ticket={ticket} />
      </motion.div>

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
      <div className="@container/ticket grid overflow-hidden rounded-card bg-card ring-1 ring-white/5 @3xl/ticket:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4 p-5 @3xl/ticket:p-0">
          <Skeleton className="hidden aspect-video w-full rounded-none @3xl/ticket:block" />
          <div className="space-y-3 @3xl/ticket:px-7 @3xl/ticket:pb-7">
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
