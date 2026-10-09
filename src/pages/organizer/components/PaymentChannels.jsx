import { useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAddPaymentChannel, useRemovePaymentChannel, useUpdatePaymentChannel } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBankProfile, paymentMethodLabel } from "@/lib/constants";
import { OrgFormSection } from "./OrgFormSection";

export function PaymentChannels({ account }) {
  const channels = account.channels;
  const [adding, setAdding] = useState(channels.length === 0);
  const [editing, setEditing] = useState(null);
  const freeBanks = account.banks.filter((bank) => !channels.some((c) => c.bankCode === bank.code));

  return (
    <>
      {channels.length > 0 && (
        <OrgFormSection title="Kênh nhận tiền"
          description="Khách chọn phương thức nào thì tiền về tài khoản của kênh có phương thức đó.">
          <ul className="grid gap-3">
            {channels.map((channel) => (
              <li key={channel.id}>
                {editing === channel.id
                  ? <ChannelForm account={account} channel={channel} onDone={() => setEditing(null)} />
                  : <ChannelCard channel={channel} bank={account.banks.find((b) => b.code === channel.bankCode)}
                    onlyOne={channels.length === 1} onEdit={() => { setEditing(channel.id); setAdding(false); }} />}
              </li>
            ))}
          </ul>
        </OrgFormSection>
      )}

      <OrgFormSection
        title={channels.length === 0 ? "Mở kênh nhận tiền" : "Thêm kênh"}
        description={channels.length === 0
          ? "Chọn ngân hàng xử lý thanh toán và nhận doanh thu, bật phương thức khách được dùng."
          : "Mỗi kênh một ngân hàng khác, với những phương thức chưa thuộc kênh nào."}
      >
        {adding ? (
          <ChannelForm account={account} onDone={() => setAdding(false)} />
        ) : freeBanks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bạn đã mở kênh ở mọi ngân hàng của cổng thanh toán.</p>
        ) : (
          <Button type="button" variant="secondary" onClick={() => { setAdding(true); setEditing(null); }}>
            <Plus aria-hidden="true" />Thêm kênh nhận tiền
          </Button>
        )}
      </OrgFormSection>
    </>
  );
}

function ChannelCard({ channel, bank, onlyOne, onEdit }) {
  const remove = useRemovePaymentChannel();
  const [confirming, setConfirming] = useState(false);
  const broken = channel.paymentMethods.filter((m) => !channel.routableMethods.includes(m));
  const onRemove = () => remove.mutate(channel.id, {
    onSuccess: () => toast.success(`Đã xoá kênh ${channel.bankName}.`),
    onError: (error) => toast.error(error.message),
  });

  return (
    <article aria-label={`Kênh ${channel.bankName}`} className="grid gap-3 border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-foreground">{channel.bankName}</h3>
        {bank && <span className="text-xs text-muted-foreground">{mockBankProfile(bank)[0]}</span>}
        {channel.primary && <Badge>Kênh chính</Badge>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {channel.paymentMethods.map((method) => <Badge key={method} variant="outline">{paymentMethodLabel(method)}</Badge>)}
      </div>
      <p className="text-sm text-muted-foreground">
        Tiền về {channel.accountName} · {channel.maskedAccountNumber}
      </p>
      {channel.primary && (
        <p className="text-xs text-muted-foreground">Tiền cổng đang giữ (bán trước khi có kênh) cũng về tài khoản này.</p>
      )}
      {broken.length > 0 && (
        <p role="alert" className="text-sm text-warning">
          {broken.map(paymentMethodLabel).join(", ")} đang bật nhưng khách chưa trả được: cổng thanh toán không còn đường đi qua {channel.bankName}.
        </p>
      )}
      {confirming ? (
        <div className="grid gap-2 border-t border-border pt-3">
          <p className="text-sm">Xoá kênh {channel.bankName}? Đơn mới sẽ không đi qua kênh này nữa; đơn cũ vẫn hoàn tiền bình thường.</p>
          <div className="flex gap-2">
            <Button type="button" variant="destructive" size="sm" disabled={remove.isPending} onClick={onRemove}>
              {remove.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
              Xoá kênh
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>Huỷ</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onEdit}><Pencil aria-hidden="true" />Sửa</Button>
          <Button type="button" variant="ghost" size="sm" disabled={onlyOne} onClick={() => setConfirming(true)}
            title={onlyOne ? "Phải còn ít nhất một kênh nhận tiền" : undefined}>
            <Trash2 aria-hidden="true" />Xoá
          </Button>
        </div>
      )}
    </article>
  );
}

function ChannelForm({ account, channel = null, onDone }) {
  const add = useAddPaymentChannel();
  const update = useUpdatePaymentChannel();
  const others = account.channels.filter((c) => c.id !== channel?.id);
  const takenBy = Object.fromEntries(others.flatMap((c) => c.paymentMethods.map((m) => [m, c.bankName])));
  const banks = channel ? account.banks.filter((b) => b.code === channel.bankCode)
    : account.banks.filter((b) => !account.channels.some((c) => c.bankCode === b.code));
  const [bankCode, setBankCode] = useState(channel?.bankCode ?? "");
  const [methods, setMethods] = useState(channel?.paymentMethods ?? []);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const bank = account.banks.find((b) => b.code === bankCode);
  const outside = bank ? methods.filter((m) => !bank.paymentMethods.includes(m)) : [];
  const sendable = bank ? methods.filter((m) => bank.paymentMethods.includes(m)) : methods;
  const typed = accountName.trim() || accountNumber;
  const accountValid = accountName.trim() && accountNumber.length >= 6;
  const valid = bank && sendable.length > 0 && (channel && !typed ? true : accountValid);
  const pending = add.isPending || update.isPending;
  const idPrefix = channel ? `channel-${channel.id}` : "new-channel";

  const chooseBank = (code) => {
    setBankCode(code);
    setMethods((account.banks.find((b) => b.code === code)?.paymentMethods ?? []).filter((m) => !takenBy[m]));
  };
  const toggle = (method, on) => setMethods((current) => (on ? [...current, method] : current.filter((m) => m !== method)));

  const onSubmit = (event) => {
    event.preventDefault();
    if (!valid) return;
    const callbacks = {
      onSuccess: () => {
        toast.success(channel ? `Đã lưu kênh ${bank.name}.` : `Đã mở kênh ${bank.name}.`);
        onDone();
      },
      onError: (error) => toast.error(error.message),
    };
    const newAccount = typed ? { accountName: accountName.trim(), accountNumber } : {};
    if (channel) update.mutate({ id: channel.id, paymentMethods: sendable, ...newAccount }, callbacks);
    else add.mutate({ bankCode, paymentMethods: sendable, ...newAccount }, callbacks);
  };

  return (
    <form onSubmit={onSubmit} aria-label={channel ? `Sửa kênh ${channel.bankName}` : "Kênh mới"}
      className="grid gap-4 border border-border p-4">
      {!channel && (
        <Field label="Ngân hàng" htmlFor={`${idPrefix}-bank`}>
          <Select value={bankCode} onValueChange={chooseBank}>
            <SelectTrigger id={`${idPrefix}-bank`} className="w-full sm:w-80"><SelectValue placeholder="Chọn ngân hàng" /></SelectTrigger>
            <SelectContent>
              {banks.map((b) => <SelectItem key={b.code} value={b.code}>{b.name} · {mockBankProfile(b)[0]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      )}
      {channel && <p className="font-medium text-foreground">{channel.bankName}</p>}
      {bank && (
        <p className="text-xs text-muted-foreground">
          Mô phỏng: {mockBankProfile(bank)[1]}
          {bank.paymentMethods.some((m) => m !== "CARD") && " QR / ví: khách bấm \"Xác nhận thanh toán\" trên trang của cổng."}
        </p>
      )}
      {bank && (
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium">Khách được thanh toán bằng</legend>
          <div className="flex flex-wrap gap-2">
            {bank.paymentMethods.map((method) => (
              <label key={method} htmlFor={`${idPrefix}-${method}`}
                className="flex items-center gap-2 border border-border px-3 py-2 text-sm has-disabled:opacity-60">
                <Checkbox id={`${idPrefix}-${method}`} checked={methods.includes(method)} disabled={Boolean(takenBy[method])}
                  onCheckedChange={(on) => toggle(method, on === true)} />
                {paymentMethodLabel(method)}
                {takenBy[method] && <span className="text-xs text-muted-foreground">(đang ở kênh {takenBy[method]})</span>}
              </label>
            ))}
          </div>
          {outside.length > 0 && (
            <p role="status" className="text-sm text-warning">
              {outside.map(paymentMethodLabel).join(", ")} đang bật cho kênh này nhưng {bank.name} không hỗ trợ (do quản trị cổng
              cấu hình riêng). Lưu kênh sẽ bỏ {outside.length > 1 ? "các phương thức" : "phương thức"} này.
            </p>
          )}
          {sendable.length === 0 && <p role="alert" className="text-sm text-destructive">Chọn ít nhất một phương thức.</p>}
        </fieldset>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên chủ tài khoản" htmlFor={`${idPrefix}-name`}>
          <Input id={`${idPrefix}-name`} autoComplete="name" value={accountName} maxLength={120}
            placeholder={channel ? channel.accountName : ""} onChange={(event) => setAccountName(event.target.value)} />
        </Field>
        <Field label="Số tài khoản" htmlFor={`${idPrefix}-number`}>
          <Input id={`${idPrefix}-number`} inputMode="numeric" autoComplete="off" value={accountNumber} maxLength={30}
            placeholder={channel ? `Hiện tại ${channel.maskedAccountNumber}` : "6–30 chữ số"}
            onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 30))} />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        {bank ? `Tài khoản phải mở tại ${bank.name}.` : "Chọn ngân hàng trước."}
        {channel && " Để trống để giữ tài khoản hiện tại."}
      </p>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || !valid}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
          {channel ? "Lưu kênh" : "Mở kênh"}
        </Button>
        {(channel || account.channels.length > 0) && (
          <Button type="button" variant="ghost" onClick={onDone}>Huỷ</Button>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }) {
  return <div className="grid gap-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}
