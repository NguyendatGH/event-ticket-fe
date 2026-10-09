import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useOrganizerWallet, useTopUpOrganizerWallet } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/site";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDateTime, formatVND } from "@/lib/format";
import { OrgFormSection } from "./components/OrgFormSection";
import { OrgHeader } from "./components/OrgUi";

const TYPE_LABELS = {
  TOP_UP: "Nạp tiền mô phỏng",
  PAYMENT_EARNED: "Doanh thu thanh toán",
  REFUND_DEBIT: "Trừ do refund",
};

export default function WalletPage() {
  useDocumentTitle("Ví seller");
  const query = useOrganizerWallet();
  if (query.isPending) return <WalletSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  return <WalletContent wallet={query.data} />;
}

function WalletContent({ wallet }) {
  const [amount, setAmount] = useState("500000");
  const [note, setNote] = useState("");
  const topUp = useTopUpOrganizerWallet();

  const submit = (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1000) {
      toast.error("Số tiền nạp phải là số nguyên từ 1.000đ");
      return;
    }
    topUp.mutate({ amount: value, note: note.trim() || undefined }, {
      onSuccess: () => {
        setNote("");
        toast.success(`Đã nạp ${formatVND(value)} vào ví seller`);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div>
      <OrgHeader
        eyebrow="Tài chính mô phỏng"
        title="Ví seller"
        meta="Theo dõi số dư của ban tổ chức. Đây là ví ảo để mô phỏng payment, refund và các biến động tiền trong môi trường demo."
      />

      <div className="grid gap-8 pt-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6" aria-label="Tổng quan ví">
          <div className="border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Số dư khả dụng mô phỏng</p>
                <p className={`mt-3 text-4xl font-semibold tracking-tight ${wallet.balance < 0 ? "text-destructive" : "text-foreground"}`}>
                  {formatVND(wallet.balance)}
                </p>
              </div>
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                <WalletCards className="size-5" />
              </span>
            </div>
            {wallet.balance < 0 ? <p className="mt-4 text-sm text-destructive">Ví đang âm do số tiền refund vượt phần đã nạp/doanh thu mô phỏng.</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Doanh thu thanh toán" value={wallet.totalSales} tone="positive" />
            <Stat label="Đã nạp mô phỏng" value={wallet.totalTopUps} tone="neutral" />
            <Stat label="Đã trừ refund" value={wallet.totalRefunds} tone="negative" />
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Audit trail</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">Biến động gần đây</h2>
              </div>
              <p className="text-xs text-muted-foreground">Tự cập nhật mỗi 5 giây</p>
            </div>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {wallet.transactions.length ? wallet.transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />) : (
                <p className="py-10 text-center text-sm text-muted-foreground">Chưa có biến động nào.</p>
              )}
            </div>
          </div>
        </section>

        <OrgFormSection title="Nạp tiền vào ví ảo" description="Thao tác này chỉ thay đổi ví mô phỏng của seller, không gọi ngân hàng thật.">
          <form onSubmit={submit} className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {[100000, 500000, 1000000].map((value) => (
                <Button key={value} type="button" variant="outline" size="sm" onClick={() => setAmount(String(value))}>
                  {formatVND(value)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-top-up-amount">Số tiền</Label>
              <Input id="wallet-top-up-amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="500000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-top-up-note">Ghi chú <span className="font-normal text-muted-foreground">(tùy chọn)</span></Label>
              <Input id="wallet-top-up-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: seed balance cho demo" />
            </div>
            <Button type="submit" className="w-full" disabled={topUp.isPending}>
              {topUp.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowDownLeft aria-hidden="true" />}
              Nạp vào ví
            </Button>
          </form>
        </OrgFormSection>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return <div className="border border-border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-2 text-lg font-semibold ${tone === "negative" ? "text-destructive" : tone === "positive" ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>{formatVND(value)}</p></div>;
}

function TransactionRow({ transaction }) {
  const debit = transaction.type === "REFUND_DEBIT";
  return (
    <div className="flex items-center gap-3 py-4">
      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${debit ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`} aria-hidden="true">
        {debit ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{TYPE_LABELS[transaction.type] || transaction.type}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{transaction.note || ""} · {formatDateTime(transaction.createdAt)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${debit ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"}`}>{debit ? "−" : "+"}{formatVND(transaction.amount)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Dư {formatVND(transaction.balanceAfter)}</p>
      </div>
    </div>
  );
}

function WalletSkeleton() {
  return <div role="status" aria-label="Đang tải ví seller" className="space-y-6"><div className="h-3 w-32 animate-pulse bg-surface" /><div className="h-10 w-64 animate-pulse bg-surface" /><div className="h-56 max-w-3xl animate-pulse bg-surface" /></div>;
}
