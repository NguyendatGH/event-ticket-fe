// Hộp thoại "Hủy hoàn tiền": BTC bỏ hẳn một yêu cầu hoàn tiền của khách (khách đòi hoàn nhưng BTC
// quyết không hoàn, hoặc yêu cầu kẹt chờ ví chi mãi không đi được).
//
// Xác nhận HAI bước (nhập lý do → xem lại hệ quả → mới gọi API) giống RefundInstructionDialog:
// đây là quyết định về tiền của khách và không undo được, nên không để bấm một cái là xong.

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

/**
 * Câu tiếng Việt cho từng mã lỗi BE trả về khi hủy. normalizeError chỉ có câu mặc định theo HTTP
 * status ("Dữ liệu gửi lên không hợp lệ.", "Dữ liệu đã thay đổi hoặc xung đột.") — đọc xong BTC
 * vẫn không biết phải làm gì, nên dịch từng mã ra việc cần làm.
 * REFUND_NOT_CANCELLABLE không có ở đây: nó được xử lý riêng trong onError (xem bên dưới).
 */
const CANCEL_ERROR = {
  REFUND_CANCEL_NOTE_REQUIRED: "Phải có lý do hủy. Bấm “Quay lại” để nhập rồi thử lại.",
  REFUND_ALREADY_AT_PROVIDER:
    "Cổng thanh toán đã nhận lệnh chi này nên không hủy được nữa. Tra dashboard PayOS xem tiền đã đi chưa, " +
    "rồi chốt “Đã chuyển xong” hoặc “Không chuyển được”.",
};

export function CancelRefundDialog({ refund, open, onOpenChange, onCancelled }) {
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false); // false = bước 1 (nhập lý do), true = bước 2 (xác nhận)
  // Hủy cũng đi qua endpoint resolve như mọi lựa chọn chốt khác, chỉ khác outcome — dùng lại hook cũ.
  const resolve = useResolveRefund();
  const refreshRefunds = useRefreshOrganizerRefunds();
  const err = resolve.error ? normalizeError(resolve.error) : null;
  const errorMessage = err ? CANCEL_ERROR[err.code] || err.message : null;

  // BE trả 400 nếu CANCELLED mà thiếu note. Chặn ngay ở FE để BTC không phải bấm rồi mới ăn lỗi server.
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
          // Mã khác thì để nguyên: câu lỗi hiện đỏ ngay trong panel xác nhận, BTC sửa rồi bấm lại.
          if (normalizeError(e).code !== "REFUND_NOT_CANCELLABLE") return;
          // Còn 409 REFUND_NOT_CANCELLABLE nghĩa là dữ liệu trên màn đã cũ (mở hai tab, hoặc poll
          // chưa kịp chạy): yêu cầu này đã được hủy / chốt ở nơi khác rồi. BTC không làm gì sai nên
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

            {/* Nói thẳng ba hệ quả, vì cả ba đều là thứ BTC sẽ bị khách hỏi lại. */}
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
