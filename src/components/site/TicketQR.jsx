// Nền sáng để máy quét đọc được trên giao diện tối.

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export function TicketQR({ value, size = 184, showCode = true, className }) {
  if (!value) return null;
  return (
    <figure className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div className="rounded-sm bg-foreground p-3">
        <QRCodeSVG value={value} size={size} level="M" bgColor="#F5F7F6" fgColor="#0B0D0C" title="Mã QR vé" />
      </div>
      {showCode ? <figcaption className="font-mono text-2xs tracking-wide break-all text-muted-foreground">{value}</figcaption> : null}
    </figure>
  );
}
