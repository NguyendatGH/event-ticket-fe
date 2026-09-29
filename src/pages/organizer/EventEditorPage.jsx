// Trang tạo / sửa sự kiện — route /organizer/events/new và /organizer/events/:id/edit (?step=1..4).
// Dữ liệu: useOrganizerEvent.

import { useParams } from "react-router-dom";
import { useOrganizerEvent } from "@/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { EventLoadError } from "./components/OrgUi";
import { EditorForm } from "./editor/EditorForm";

export default function EventEditorPage() {
  const { id } = useParams();
  const query = useOrganizerEvent(id);
  useDocumentTitle(id ? "Chỉnh sửa sự kiện" : "Tạo sự kiện");

  if (!id) return <EditorForm key="new" />;
  if (query.isPending) return <EditorSkeleton />;
  if (query.isError) return <EventLoadError error={query.error} onRetry={query.refetch} />;
  return <EditorForm key={id} event={query.data} />;
}

function EditorSkeleton() {
  return (
    <div role="status" aria-label="Đang tải sự kiện">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-2/3 max-w-lg" />
      <div className="mt-8 flex gap-8 border-y border-border py-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-32" />
        ))}
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-[180px_1fr]">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
