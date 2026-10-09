import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorActions({ isDraft, busy, readOnly, isDirty, missingCount, onSave, onPublish }) {
  const pending = Boolean(busy);
  const ready = missingCount === 0;

  if (!isDraft) {
    return (
      <Button type="button" onClick={onSave} disabled={pending || readOnly || !isDirty}>
        {busy === "save" ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Lưu thay đổi
      </Button>
    );
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={onSave} disabled={pending || readOnly}>
        {busy === "save" ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Lưu nháp
      </Button>
      <Button
        type="button"
        variant={ready ? "default" : "secondary"}
        onClick={onPublish}
        disabled={pending || readOnly}
        title={ready ? undefined : `Còn ${missingCount} mục cần bổ sung`}
        className="transition-[background-color,border-color,color] duration-400"
      >
        {busy === "publish" ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Xuất bản
      </Button>
    </>
  );
}
