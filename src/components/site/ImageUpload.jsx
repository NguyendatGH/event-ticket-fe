// Chọn ảnh → POST /uploads/images → onChange(url).

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadImage } from "@/api";
import { UPLOAD_ACCEPT, UPLOAD_MAX_BYTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const RATIO = { "4/3": "aspect-card", "16/9": "aspect-video", "1/1": "aspect-square", "3/1": "aspect-[3/1]" };

export function ImageUpload({
  value,
  onChange,
  folder = "events",
  aspect = "16/9",
  label = "Tải ảnh lên",
  hint = "JPG, PNG, WEBP hoặc GIF, tối đa 5MB.",
  disabled = false,
  invalid = false,
  className,
  id: idProp,
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const upload = useUploadImage();
  const busy = upload.isPending;

  const pick = () => !disabled && !busy && inputRef.current?.click();

  const handleFile = (file) => {
    if (!file) return;
    if (!UPLOAD_ACCEPT.split(",").includes(file.type)) {
      toast.error("Định dạng ảnh không được hỗ trợ.");
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error("Ảnh vượt quá 5MB.");
      return;
    }
    setProgress(0);
    upload.mutate(
      { file, folder, onProgress: setProgress },
      {
        onSuccess: (res) => onChange?.(res.url),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        disabled={disabled || busy}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative w-full overflow-hidden border bg-input-bg transition-colors",
          RATIO[aspect] || aspect,
          value ? "border-border" : "border-dashed border-border-hover",
          dragging && "border-primary",
          invalid && "border-destructive"
        )}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={disabled || busy}
            className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
          >
            <ImagePlus className="size-5.5" aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-caption text-disabled-foreground">{hint}</span>
          </button>
        )}
        {busy ? (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Loader2 className="size-5 animate-spin text-foreground" aria-label="Đang tải ảnh" />
          </div>
        ) : null}
      </div>

      {busy ? <Progress value={progress} aria-label="Tiến độ tải ảnh" /> : null}

      {value ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={pick} disabled={disabled || busy}>
            <RefreshCw aria-hidden="true" />
            Thay ảnh
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange?.(null)} disabled={disabled || busy}>
            <Trash2 aria-hidden="true" />
            Xóa
          </Button>
        </div>
      ) : null}
    </div>
  );
}
