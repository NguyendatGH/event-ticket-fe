// Chọn vé, xác nhận tài khoản nhận tiền và email nhận thông báo.
// Điền sẵn tài khoản đã thanh toán; giữ nguyên thì hoàn tự động, đổi sang tài khoản khác thì BTC phải duyệt.
// Email là bắt buộc (BE @NotBlank @Email): BTC hủy yêu cầu thì hệ thống phải có chỗ để báo cho khách.

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Notice, Price } from "@/components/site";
import { useAppConfig } from "@/api";
import { formatVND } from "@/lib/format";
import { v } from "@/lib/forms";

const REASON_MAX = 500;
const EMAIL_MAX = 200;   // BE: @Size(max = 200) trên contactEmail

// Dùng lại validator email của repo (lib/forms) để câu lỗi giống hệt các form khác.
// .safeParse() trả về data đã trim -> gửi lên BE là bản đã trim, khỏi tự xử lý.
const emailRule = v.email("Email nhận thông báo");

export function RefundDialog({
  open,
  onOpenChange,
  tickets = [],
  payment,
  customerEmail = "",
  unitPrice,
  loading = false,
  error,
  onSubmit,
}) {
  const { banks = [] } = useAppConfig();
  const payerAccount = payment?.payerAccountNumber ?? "";
  const payerBin = payment?.payerBankBin ?? "";

  const refundable = useMemo(() => tickets.filter((t) => t.status === "ACTIVE"), [tickets]);
  const [selected, setSelected] = useState(() => refundable.map((t) => t.id));
  const [reason, setReason] = useState("");
  const [bin, setBin] = useState(payerBin);
  const [account, setAccount] = useState(payerAccount);
  // Điền sẵn email của đơn, nhưng cho sửa: có người trả tiền bằng email khác, hoặc muốn nhận thông báo ở email khác.
  const [email, setEmail] = useState(customerEmail);
  const [emailError, setEmailError] = useState(null);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const estimate = unitPrice != null ? selected.length * unitPrice : null;

  // Cùng số tài khoản = tiền về chỗ cũ, BE chạy tự động. Khác số = BTC phải duyệt trước khi chi.
  const samePayer = account.trim() !== "" && account.trim() === payerAccount;
  const needsBankChoice = !payerBin;
  // Cố ý KHÔNG nhét email vào đây: nút bị disable thì bấm cũng không hiện được lý do.
  // Email sai để nút vẫn bấm được, bấm xong báo lỗi ngay dưới ô cho khách biết phải sửa gì.
  const ready = selected.length > 0 && bin && account.trim();

  const submit = () => {
    const checked = emailRule.safeParse(email);
    if (!checked.success) {
      setEmailError(checked.error.issues[0].message);
      return;   // chặn tại FE, không gọi API
    }
    onSubmit({
      ticketIds: selected,
      reason: reason.trim() || undefined,
      destination: { bin, accountNumber: account.trim() },
      contactEmail: checked.data,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Yêu cầu hoàn vé</AlertDialogTitle>
          <AlertDialogDescription>
            Vé đã chọn sẽ bị hủy và trả lại cho người khác mua. Kiểm tra kỹ tài khoản nhận tiền bên dưới.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <fieldset className="space-y-6" disabled={loading}>
          <div className="space-y-3">
            <legend className="eyebrow">
              Chọn vé ({selected.length}/{refundable.length})
            </legend>
            <ul className="divide-y divide-border border-y border-border">
              {refundable.map((t, i) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <Checkbox id={`refund-${t.id}`} checked={selected.includes(t.id)} onCheckedChange={() => toggle(t.id)} />
                  <Label htmlFor={`refund-${t.id}`} className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5">
                    <span className="font-medium">
                      Vé {i + 1} — {t.tierName}
                    </span>
                    <code className="text-[12px] break-all text-muted-foreground">{t.ticketCode}</code>
                  </Label>
                  {unitPrice != null ? (
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{formatVND(unitPrice)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <legend className="eyebrow">Tài khoản nhận tiền</legend>

            {needsBankChoice ? (
              <Notice title="Cần chọn ngân hàng">
                Cổng thanh toán không gửi về mã ngân hàng dùng được. Chọn đúng ngân hàng của số tài khoản bên dưới thì
                tiền vẫn được hoàn tự động.
              </Notice>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="refund-bank">Ngân hàng</Label>
                <Select value={bin} onValueChange={setBin}>
                  <SelectTrigger id="refund-bank" className="w-full">
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.filter((b) => b.supported !== false).map((b) => (
                      <SelectItem key={b.bin} value={b.bin}>{b.name}</SelectItem>
                    ))}
                    {banks.some((b) => b.supported === false) && (
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground">Chưa hỗ trợ ở cổng đang dùng</SelectLabel>
                        {banks.filter((b) => b.supported === false).map((b) => (
                          <SelectItem key={b.bin} value={b.bin} disabled>{b.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refund-account">Số tài khoản</Label>
                <Input
                  id="refund-account"
                  inputMode="numeric"
                  value={account}
                  onChange={(e) => setAccount(e.target.value.replace(/\s/g, ""))}
                  placeholder="Số tài khoản nhận tiền"
                />
              </div>
            </div>

            {samePayer ? (
              <p className="text-sm text-muted-foreground">Trùng tài khoản đã thanh toán — tiền được hoàn tự động.</p>
            ) : (
              <p className="text-sm text-warning-foreground">
                Khác tài khoản đã thanh toán. Yêu cầu sẽ chuyển cho ban tổ chức duyệt trước khi chuyển tiền.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-email">Email nhận thông báo</Label>
            <Input
              id="refund-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={EMAIL_MAX}
              value={email}
              placeholder="ban@example.com"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "refund-email-error" : "refund-email-hint"}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);   // khách đang sửa thì bỏ lỗi cũ, đừng để chữ đỏ đứng đó gây khó chịu
              }}
            />
            {emailError ? (
              <p id="refund-email-error" className="text-sm text-destructive">
                {emailError}
              </p>
            ) : (
              <p id="refund-email-hint" className="text-sm text-muted-foreground">
                Chúng tôi gửi thông báo về yêu cầu hoàn vé này tới email này — kể cả khi ban tổ chức hủy yêu cầu. Điền
                sẵn email của đơn, bạn đổi được nếu muốn nhận ở email khác.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-reason">Lý do (không bắt buộc)</Label>
            <Textarea
              id="refund-reason"
              value={reason}
              maxLength={REASON_MAX}
              rows={3}
              placeholder="Ví dụ: bận đột xuất không tham dự được"
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </fieldset>

        {estimate != null ? (
          <p className="flex items-baseline justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <Price value={estimate} />
          </p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Đóng</AlertDialogCancel>
          <Button disabled={loading || !ready} onClick={submit}>
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {samePayer ? "Hoàn tiền" : "Gửi cho ban tổ chức duyệt"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
