import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAppConfig, useOrganizerPayoutAccount, useSaveOrganizerPayoutAccount } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "@/components/site";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { paymentMethodLabel } from "@/lib/constants";
import { OrgFormSection } from "./components/OrgFormSection";
import { PaymentChannels } from "./components/PaymentChannels";
import { OrgHeader } from "./components/OrgUi";

export default function PayoutAccountPage() {
  useDocumentTitle("Tài khoản nhận tiền");
  const query = useOrganizerPayoutAccount();
  return (
    <div>
      <OrgHeader
        eyebrow="Thanh toán"
        title="Tài khoản nhận tiền"
        meta="Chọn ngân hàng nhận doanh thu bán vé và cách khách được thanh toán."
      />
      <div className="max-w-3xl pt-10">
        {query.isPending ? (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />Đang tải tài khoản nhận tiền…
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : (
          <>
            <OrgFormSection title="Trạng thái" description="Khách mua vé được ngay; tài khoản nhận tiền quyết định doanh thu về đâu.">
              <PayoutStatus account={query.data} />
            </OrgFormSection>
            {Array.isArray(query.data.channels)
              ? <PaymentChannels account={query.data} />
              : <PayoutAccountForm key={query.data.updatedAt ?? "new"} account={query.data} />}
          </>
        )}
      </div>
    </div>
  );
}

function useSubmit() {
  const save = useSaveOrganizerPayoutAccount();
  const submit = (body) => save.mutate(body, {
    onSuccess: (data) => toast.success(data.payoutSynced
      ? "Đã lưu. Doanh thu sẽ về tài khoản này."
      : "Đã lưu. Đang cập nhật tài khoản với cổng thanh toán."),
    onError: (error) => toast.error(error.message),
  });
  return { submit, isPending: save.isPending };
}

function PayoutAccountForm({ account }) {
  const { banks = [] } = useAppConfig();
  const { submit, isPending } = useSubmit();
  const hasAccount = Boolean(account.bankBin);
  const [form, setForm] = useState({ bankBin: account.bankBin ?? "", accountName: account.accountName ?? "", accountNumber: "" });
  const patch = (next) => setForm((current) => ({ ...current, ...next }));
  const valid = form.bankBin && form.accountName.trim() && form.accountNumber.length >= 6;

  return (
    <OrgFormSection
      title={hasAccount ? "Đổi tài khoản" : "Khai tài khoản"}
      description="Đơn thanh toán sau khi lưu sẽ về tài khoản mới; đơn đã thanh toán trước đó giữ nguyên."
    >
      <form onSubmit={(event) => { event.preventDefault(); submit(form); }} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ngân hàng" htmlFor="payout-bank">
            <Select value={form.bankBin} onValueChange={(value) => patch({ bankBin: value })}>
              <SelectTrigger id="payout-bank" className="w-full"><SelectValue placeholder="Chọn ngân hàng" /></SelectTrigger>
              <SelectContent>
                {banks.map((bank) => <SelectItem key={bank.bin} value={bank.bin}>{bank.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tên chủ tài khoản" htmlFor="payout-name">
            <Input id="payout-name" autoComplete="name" value={form.accountName} maxLength={120} required
              onChange={(event) => patch({ accountName: event.target.value })} />
          </Field>
          <Field label="Số tài khoản" htmlFor="payout-number">
            <Input id="payout-number" inputMode="numeric" autoComplete="off" value={form.accountNumber} minLength={6} maxLength={30}
              placeholder={hasAccount ? `Hiện tại ${account.maskedAccountNumber}` : "6–30 chữ số"} required
              onChange={(event) => patch({ accountNumber: event.target.value.replace(/\D/g, "").slice(0, 30) })} />
          </Field>
        </div>
        <div>
          <Button type="submit" disabled={isPending || !valid}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            Lưu tài khoản
          </Button>
        </div>
      </form>
    </OrgFormSection>
  );
}

function PayoutStatus({ account }) {
  if (!account.acceptingPayments) {
    return (
      <StatusCard tone="warning" title="Đang kết nối với cổng thanh toán">
        Encore đang mở tài khoản người bán cho bạn trên cổng thanh toán, thường xong trong vài giây. Tải lại trang sau ít phút.
      </StatusCard>
    );
  }
  const methods = account.paymentMethods?.length
    ? ` Khách thanh toán bằng: ${account.paymentMethods.map(paymentMethodLabel).join(", ")}.`
    : "";
  const channels = account.channels ?? [];
  if (channels.length > 1) {
    return (
      <StatusCard tone="ok" title={`Đang nhận thanh toán qua ${channels.length} kênh`}>
        {channels.map((c) => c.bankName).join(", ")}: mỗi phương thức về tài khoản của kênh giữ nó.{methods}
      </StatusCard>
    );
  }
  if (!account.bankBin) {
    return (
      <StatusCard tone="warning" title="Đang nhận thanh toán — tiền đang được giữ">
        Khách đã mua vé được. Doanh thu được cổng thanh toán giữ lại và chuyển về ngay khi bạn
        {account.channels ? " mở kênh nhận tiền" : " khai tài khoản nhận tiền"} bên dưới.{methods}
      </StatusCard>
    );
  }
  return (
    <StatusCard tone={account.payoutSynced ? "ok" : "warning"} title="Đang nhận thanh toán">
      {account.payoutSynced ? "Doanh thu về" : "Đang cập nhật với cổng thanh toán:"} {account.bankName} · {account.accountName} · {account.maskedAccountNumber}.{methods}
    </StatusCard>
  );
}

function StatusCard({ tone, title, children }) {
  const ok = tone === "ok";
  return (
    <div className={`flex items-start gap-3 border p-4 ${ok ? "border-primary/50 bg-primary/5" : "border-warning/50 bg-warning/5"}`}>
      {ok
        ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        : <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />}
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return <div className="grid gap-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}
