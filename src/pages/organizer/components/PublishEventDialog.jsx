import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/site";
import { usePublishOrganizerEvent } from "@/api";
import { fieldLabel, stepOfField } from "../editor/schema";
import { normalizeServerField } from "../editor/serverErrors";

export function PublishEventDialog({ event, open, onOpenChange, onPublished }) {
  const navigate = useNavigate();
  const publish = usePublishOrganizerEvent();
  const [missing, setMissing] = useState(null);

  const handleOpenChange = (next) => {
    if (!next) {
      setMissing(null);
      publish.reset();
    }
    onOpenChange(next);
  };

  const confirm = () =>
    publish.mutate(event.id, {
      onSuccess: (detail) => {
        toast.success("Đã xuất bản sự kiện", { description: detail?.name || event.name });
        handleOpenChange(false);
        onPublished?.(detail);
      },
      onError: (err) => {
        if (err.code === "EVENT_INCOMPLETE" && err.errors?.length) {
          setMissing(err.errors.map((e) => ({ ...e, path: normalizeServerField(e.field) })));
        } else {
          toast.error(err.message);
          handleOpenChange(false);
        }
      },
    });

  const firstStep = missing?.length ? Math.min(...missing.map((m) => stepOfField(m.path))) : 0;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={missing ? "Chưa đủ thông tin để xuất bản" : "Xuất bản sự kiện?"}
      description={
        missing
          ? "Bổ sung các mục sau trong trình chỉnh sửa rồi xuất bản lại."
          : `"${event?.name ?? ""}" sẽ hiển thị công khai và mở bán vé ngay sau khi xuất bản.`
      }
      confirmLabel={missing ? "Mở trình chỉnh sửa" : "Xuất bản"}
      cancelLabel={missing ? "Đóng" : "Hủy"}
      loading={publish.isPending}
      onConfirm={missing ? () => navigate(`/organizer/events/${event.id}/edit?step=${firstStep + 1}`) : confirm}
    >
      {missing ? (
        <div>
          <ul className="border-t border-border text-sm">
            {missing.map((m) => (
              <li key={`${m.field}-${m.message}`} className="grid grid-cols-[120px_1fr] gap-4 border-b border-border py-2.5">
                <span className="text-muted-foreground">{fieldLabel(m.path)}</span>
                <span className="text-foreground">{m.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ConfirmDialog>
  );
}
