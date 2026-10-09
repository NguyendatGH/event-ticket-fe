
import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeError, useRefundInstruction, useResolveRefund } from "@/api";
import { ErrorState, Notice } from "@/components/site";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/lib/format";
import { refundReasonForOrganizer } from "@/lib/constants";
import { Recap } from "./OrgUi";

const NOTE_MAX = 500;

const OUTCOMES = {
  SUCCEEDED: {
    label: "Đã chuyển xong",
    variant: "default",
    confirmTitle: "Xác nhận đã chuyển tiền cho khách?",
    confirmText:
      "Yêu cầu sẽ được đánh dấu ĐÃ HOÀN TIỀN, vé bị hủy hẳn và khách nhận mail thông báo. Chỉ bấm khi bạn đã thấy tiền ra khỏi tài khoản.",
    confirmLabel: "Đúng, tôi đã chuyển tiền",
  },
  FAILED: {
    label: "Không chuyển được",
    variant: "destructive",
    confirmTitle: "Từ chối yêu cầu hoàn tiền này?",
    confirmText:
      "Yêu cầu chuyển sang HOÀN TIỀN THẤT BẠI, vé được trả lại trạng thái hợp lệ cho khách. Khách sẽ phải gửi yêu cầu mới nếu vẫn muốn hoàn.",
    confirmLabel: "Từ chối yêu cầu",
    noteRequired: true,
  },
  RETRY: {
    label: "Gửi lại qua cổng",
    variant: "secondary",
    confirmTitle: "Gửi lại lệnh chi qua cổng thanh toán?",
    confirmText:
      "Yêu cầu quay về hàng chờ để hệ thống tự chi. Chỉ dùng khi bạn CHƯA chuyển khoản tay, nếu không khách sẽ nhận tiền hai lần.",
    confirmLabel: "Gửi lại qua cổng",
  },
};

export function RefundInstructionDialog({ refund, open, onOpenChange, onResolved }) {
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState(null);
  const instructionQ = useRefundInstruction(refund?.id);
  const resolve = useResolveRefund();
  const error = resolve.error ? normalizeError(resolve.error) : null;

  const canRetry = !refund?.providerRefundId;
  const step2 = outcome ? OUTCOMES[outcome] : null;
  const noteMissing = Boolean(step2?.noteRequired) && !note.trim();

  const submit = () =>
    resolve.mutate(
      { id: refund.id, body: { outcome, note: note.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success(outcome === "RETRY" ? "Đã gửi lại lệnh chi" : "Đã cập nhật yêu cầu hoàn tiền");
          onResolved?.();
          onOpenChange(false);
        },
      }
    );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {step2 ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{step2.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{step2.confirmText}</AlertDialogDescription>
            </AlertDialogHeader>

            <dl className="border-y border-border text-sm">
              <Recap label="Số tiền" value={formatVND(refund.amount)} />
              <Recap label="Tài khoản nhận" value={refund.destinationAccountMasked || "—"} />
              <Recap label="Ghi chú" value={note.trim() || "(để trống)"} />
            </dl>

            {noteMissing ? (
              <p className="text-sm text-warning">Ghi chú là bắt buộc khi từ chối, để sau này tra lại biết vì sao.</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

            <AlertDialogFooter>
              <Button variant="ghost" disabled={resolve.isPending} onClick={() => setOutcome(null)}>
                Quay lại
              </Button>
              <Button variant={step2.variant} disabled={resolve.isPending || noteMissing} onClick={submit}>
                {resolve.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {step2.confirmLabel}
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Chuyển khoản tay {formatVND(refund.amount)}</AlertDialogTitle>
              <AlertDialogDescription>
                Hệ thống không chi tự động được yêu cầu này. Chuyển tiền theo thông tin bên dưới rồi chốt kết quả.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {refundReasonForOrganizer(refund) ? (
              <Notice tone="warning" title="Vì sao phải làm tay">
                {refundReasonForOrganizer(refund)}
              </Notice>
            ) : null}

            <Instruction query={instructionQ} />

            <div className="space-y-2">
              <Label htmlFor="resolve-note">Ghi chú (lưu lại để sau tra cứu)</Label>
              <Textarea
                id="resolve-note"
                value={note}
                rows={2}
                maxLength={NOTE_MAX}
                placeholder="Ví dụ: đã chuyển Vietcombank 14:20, mã GD 123456"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="grid gap-2 border-t border-border pt-4">
              <Button onClick={() => setOutcome("SUCCEEDED")}>{OUTCOMES.SUCCEEDED.label}</Button>
              {canRetry ? (
                <Button variant="secondary" onClick={() => setOutcome("RETRY")}>
                  {OUTCOMES.RETRY.label}
                </Button>
              ) : (
                <p className="text-meta leading-relaxed text-muted-foreground">
                  Cổng thanh toán đã nhận lệnh này rồi nên không gửi lại được. Tra dashboard PayOS xem tiền đã đi chưa,
                  rồi chốt “Đã chuyển xong” hoặc “Không chuyển được”.
                </p>
              )}
              <Button variant="destructive" onClick={() => setOutcome("FAILED")}>
                {OUTCOMES.FAILED.label}
              </Button>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Để sau</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Instruction({ query }) {
  if (query.isPending) {
    return (
      <div className="space-y-3" role="status" aria-label="Đang tải thông tin chuyển khoản">
        <Skeleton className="mx-auto size-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (query.isError) {
    if (query.error?.code === "REFUND_DESTINATION_UNKNOWN") {
      return (
        <Notice tone="danger" title="Chưa dựng được QR cho yêu cầu này">
          Yêu cầu chưa có ngân hàng / số tài khoản hợp lệ để nhận tiền. Liên hệ khách xin lại thông tin rồi nhờ khách
          gửi yêu cầu mới, và chốt yêu cầu này là “Không chuyển được”.
        </Notice>
      );
    }
    return <ErrorState compact error={query.error} onRetry={query.refetch} />;
  }

  const ins = query.data;
  return (
    <div className="space-y-4">
      {ins.qrImageUrl ? (
        <figure className="flex flex-col items-center gap-2">
          <img
            src={ins.qrImageUrl}
            alt={`Mã QR chuyển ${formatVND(ins.amount)} tới số tài khoản ${ins.accountNumber}`}
            className="size-44 bg-white"
            loading="lazy"
          />
          <figcaption className="text-meta text-muted-foreground">Quét bằng app ngân hàng để điền sẵn mọi thứ</figcaption>
        </figure>
      ) : null}

      <dl className="border-y border-border text-sm">
        <CopyRow label="Ngân hàng" value={ins.bankName || ins.bankBin} copyable={false} />
        <CopyRow label="Số tài khoản" value={ins.accountNumber} />
        <CopyRow label="Số tiền" value={formatVND(ins.amount)} copyable={false} />
        <CopyRow label="Nội dung" value={ins.content} />
      </dl>
    </div>
  );
}

function CopyRow({ label, value, copyable = true }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`Đã copy ${label.toLowerCase()}`);
    } catch {
      toast.error("Trình duyệt không cho copy. Bạn bôi đen rồi copy tay giúp nhé.");
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium break-all text-foreground tabular-nums">{value || "—"}</dd>
      {copyable && value ? (
        <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
          <Copy aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
