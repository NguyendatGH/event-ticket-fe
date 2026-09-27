import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Nút hành động của trình sửa sự kiện (hiện 2 chỗ: thanh bước trên desktop, thanh dính đáy trên điện thoại).
 *   Bản nháp        → "Lưu nháp" + "Xuất bản"
 *   Đã xuất bản     → "Lưu thay đổi" (chỉ bấm được khi có thay đổi)
 *   busy            "save" | "publish" | null: nút đang chạy hiện vòng xoay, mọi nút khóa
 *   missingCount    số mục checklist còn thiếu (0 = đủ điều kiện xuất bản)
 */
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
      {/* Luôn bấm được (bấm khi chưa đủ sẽ nhảy tới mục thiếu), nhưng chỉ thành nút chính khi checklist đủ. */}
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
