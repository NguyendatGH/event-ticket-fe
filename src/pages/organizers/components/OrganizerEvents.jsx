import { Link } from "react-router-dom";
import { CalendarX2 } from "lucide-react";
import { flattenPages, totalOf, useOrganizerPublicEvents } from "@/api";
import {
  EmptyState,
  ErrorState,
  EventGrid,
  InfiniteSentinel,
} from "@/components/site";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

const EMPTY_TEXT = {
  upcoming: {
    title: "Chưa có sự kiện sắp diễn ra",
    description:
      "Ban tổ chức chưa mở bán sự kiện mới. Xem các sự kiện khác trong lúc chờ.",
  },
  past: {
    title: "Chưa có sự kiện đã diễn ra",
    description: "Các sự kiện đã kết thúc của ban tổ chức sẽ hiện ở đây.",
  },
};

export function OrganizerEvents({ slug, scope }) {
  const query = useOrganizerPublicEvents(slug, { scope });
  const events = flattenPages(query.data);
  if (query.isError && !query.data) {
    return <ErrorState error={query.error} onRetry={query.refetch} />;
  }
  if (!query.isPending && events.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title={EMPTY_TEXT[scope].title}
        description={EMPTY_TEXT[scope].description}
        action={
          <Button asChild variant="secondary">
            <Link to="/events">Khám phá sự kiện</Link>
          </Button>
        }
      />
    );
  }
  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground" aria-live="polite">
        {query.isPending ? " " : `${formatNumber(totalOf(query.data))} sự kiện`}
      </p>
      <EventGrid events={events} loading={query.isPending} skeletonCount={4} />
      {query.data ? (
        <InfiniteSentinel
          query={query}
          endLabel={query.data.pages.length > 1 ? undefined : null}
        />
      ) : null}
    </>
  );
}
