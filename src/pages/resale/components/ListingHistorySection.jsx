import { motion } from "motion/react";
import { History } from "lucide-react";
import { useResaleHistory } from "@/api";
import { ErrorState, SectionHeader } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/motion";
import { HistoryTimeline } from "./HistoryTimeline";

/**
 * Mục "Lịch sử giao dịch" của trang /resale/:id. Tự tải bằng useResaleHistory(id)
 * (GET /resale/listings/{id}/history), không chặn phần còn lại của trang.
 */
export function ListingHistorySection({ id }) {
  const history = useResaleHistory(id);

  let content;
  if (history.isPending) {
    content = (
      <div className="space-y-6" role="status" aria-label="Đang tải lịch sử">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-6">
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (history.isError) {
    content = <ErrorState compact error={history.error} onRetry={history.refetch} />;
  } else if (history.data?.length) {
    content = <HistoryTimeline items={history.data} />;
  } else {
    content = (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <History className="size-4" aria-hidden="true" />
        Chưa có giao dịch nào được ghi nhận.
      </p>
    );
  }

  return (
    <motion.section variants={fadeUp} aria-label="Lịch sử giao dịch" className="pt-16">
      <SectionHeader title="Lịch sử giao dịch" as="h2" className="mb-6" />
      {content}
      <p className="mt-6 text-caption text-muted-foreground">Tên người mua, người bán được rút gọn để bảo vệ thông tin cá nhân.</p>
    </motion.section>
  );
}
