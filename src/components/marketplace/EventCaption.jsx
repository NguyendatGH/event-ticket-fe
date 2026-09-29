// Đặt trong phần tử có class `group` (tên đổi màu khi hover thẻ).

import { formatDate } from "@/lib/format";
import { Price, StatusBadge } from "@/components/site";
import { cn } from "@/lib/utils";
import { CLOSED_STATUSES } from "./eventStatus";

export function EventCaption({ event, titleAs: Title = "h3", className }) {
  const { name, startsAt, venue, priceFrom, status } = event;
  return (
    <div className={cn("mt-3 space-y-1", className)}>
      <Title className="line-clamp-2 text-ui leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">{name}</Title>
      <p className="truncate text-meta text-muted-foreground tabular-nums">{[formatDate(startsAt), venue?.city].filter(Boolean).join(" · ")}</p>
      <div className="pt-0.5">{CLOSED_STATUSES.has(status) ? <StatusBadge kind="event" status={status} /> : <Price value={priceFrom} from size="sm" />}</div>
    </div>
  );
}
