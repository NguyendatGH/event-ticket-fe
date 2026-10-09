import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeError, useRefreshOrganizerRefunds, useResolveRefund } from "@/api";
import { Notice } from "@/components/site";
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
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/lib/format";
import { Recap } from "./OrgUi";

const NOTE_MAX = 500;

const CANCEL_ERROR = {
  REFUND_CANCEL_NOTE_REQUIRED: "Phải có lý do hủy. Bấm “Quay lại” để nhập rồi thử lại.",
  REFUND_ALREADY_AT_PROVIDER:
    "Cổng thanh toán đã nhận lệnh chi này nên không hủy được nữa. Tra dashboard PayOS xem tiền đã đi chưa, " +
    "rồi chốt “Đã chuyển xong” hoặc “Không chuyển được”.",
};

export function CancelRefundDialog({ refund, open, onOpenChange, onCancelled }) {
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const resolve = useResolveRefund();
  const refreshRefunds = useRefreshOrganizerRefunds();
  const err = resolve.error ? normalizeError(resolve.error) : null;
  const errorMessage = err ? CANCEL_ERROR[err.code] || err.message : null;

  const reason = note.trim();
  const noteMissing = !reason;

  const submit = () =>
    resolve.mutate(
      { id: refund.id, body: { outcome: "CANCELLED", note: reason } },
      {
        onSuccess: () => {
          toast.success("Đã hủy yêu cầu hoàn tiền");
          onCancelled?.();
          onOpenChange(false);
        },
        onError: (e) => {
          if (normalizeError(e).code !== "REFUND_NOT_CANCELLABLE") return;
          // đừng báo đỏ như sự cố — nói nhẹ một câu, nạp lại danh sách cho khớp BE rồi đóng.
          toast.info("Yêu cầu này đã được hủy hoặc chốt ở nơi khác rồi. Danh sách vừa được nạp lại.");
          refreshRefunds();
          onCancelled?.();
          onOpenChange(false);
        },
      }
    );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {confirming ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận hủy yêu cầu hoàn tiền?</AlertDialogTitle>
              <AlertDialogDescription>
                Đọc lại một lượt rồi mới bấm — hủy xong là không mở lại được yêu cầu này.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <dl className="border-y border-border text-sm">
              <Recap label="Số tiền" value={formatVND(refund.amount)} />
              <Recap label="Tài khoản nhận" value={refund.destinationAccountMasked || "—"} />
              <Recap label="Lý do hủy" value={reason || "(chưa nhập)"} />
            </dl>

            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-secondary-foreground">
              <li>Yêu cầu chuyển sang “Đã hủy”, hệ thống không chi tiền nữa.</li>
              <li>Vé của khách quay về trạng thái hợp lệ — khách giữ vé và vẫn vào được sự kiện.</li>
              <li>Khách thấy trạng thái này trên trang đơn của họ, kèm câu giải thích là bạn đã hủy.</li>
            </ul>

            {noteMissing ? (
              <p className="text-sm text-warning">Chưa có lý do hủy. Bấm “Quay lại” để nhập trước đã.</p>
            ) : null}
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <AlertDialogFooter>
              <Button variant="ghost" disabled={resolve.isPending} onClick={() => setConfirming(false)}>
                Quay lại
              </Button>
              <Button variant="destructive" disabled={resolve.isPending || noteMissing} onClick={submit}>
                {resolve.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                Hủy yêu cầu hoàn tiền
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Hủy yêu cầu hoàn tiền {formatVND(refund.amount)}?</AlertDialogTitle>
              <AlertDialogDescription>
                Dùng khi bạn quyết định không hoàn tiền cho khách, hoặc yêu cầu bị kẹt chờ nguồn tiền quá lâu và bạn
                muốn dừng hẳn.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Notice tone="warning" title="Không mở lại được">
              Yêu cầu đã hủy thì không khôi phục được. Nếu sau này vẫn muốn hoàn, khách phải gửi yêu cầu mới.
            </Notice>

            <div className="space-y-2">
              <Label htmlFor="cancel-refund-note">Lý do hủy</Label>
              <Textarea
                id="cancel-refund-note"
                value={note}
                rows={3}
                maxLength={NOTE_MAX}
                placeholder="Ví dụ: sự kiện vẫn diễn ra bình thường, ngoài thời hạn hoàn vé theo điều khoản"
                aria-describedby="cancel-refund-note-hint"
                onChange={(e) => setNote(e.target.value)}
              />
              <p id="cancel-refund-note-hint" className="text-xs leading-relaxed text-muted-foreground">
                Bắt buộc. Khách không thấy nguyên văn ghi chú này, nhưng nó là dòng duy nhất còn lại để sau tra vì sao
                yêu cầu bị hủy.
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Để sau</AlertDialogCancel>
              <Button variant="destructive" disabled={noteMissing} onClick={() => setConfirming(true)}>
                Tiếp tục
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
