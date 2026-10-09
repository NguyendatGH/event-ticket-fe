import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useBuyerWallet, useTopUpBuyerWallet } from "@/api";
import { AccountPageHeader, AccountSection } from "@/components/account";
import { ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDateTime, formatVND } from "@/lib/format";

const TYPE_LABELS = { TOP_UP: "Nạp tiền mô phỏng", ORDER_PAYMENT: "Thanh toán đơn hàng", REFUND_CREDIT: "Hoàn tiền đơn hàng" };

export default function WalletPage() {
  useDocumentTitle("Ví Encore");
  const query = useBuyerWallet();
  if (query.isPending) return <WalletSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  return <WalletContent wallet={query.data} />;
}

function WalletContent({ wallet }) {
  const [amount, setAmount] = useState("500000");
  const [note, setNote] = useState("");
  const topUp = useTopUpBuyerWallet();
  const submit = (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1000) {
      toast.error("Số tiền nạp phải là số nguyên từ 1.000đ");
      return;
    }
    topUp.mutate({ amount: value, note: note.trim() || undefined }, {
      onSuccess: () => { setNote(""); toast.success(`Đã nạp ${formatVND(value)} vào Ví Encore`); },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <>
      <AccountPageHeader icon={WalletCards} title="Ví Encore" description="Nạp tiền mô phỏng để mua vé trực tiếp bằng số dư ví và nhận refund về lại ví." />
      <div className="space-y-5">
        <section className="rounded-card bg-card p-5 ring-1 ring-white/5 md:p-7" aria-label="Số dư Ví Encore">
          <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">{formatVND(wallet.balance)}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Đã nạp" value={wallet.totalTopUps} />
            <Stat label="Đã chi mua vé" value={wallet.totalSpent} />
            <Stat label="Đã nhận refund" value={wallet.totalRefunds} />
          </div>
        </section>

        <AccountSection icon={ArrowDownLeft} title="Nạp tiền mô phỏng" description="Không gọi ngân hàng thật; dùng cho demo và test flow mua hàng.">
          <form onSubmit={submit} className="max-w-lg space-y-4">
            <div className="flex flex-wrap gap-2">
              {[100000, 500000, 1000000].map((value) => <Button key={value} type="button" variant="secondary" size="sm" onClick={() => setAmount(String(value))}>{formatVND(value)}</Button>)}
            </div>
            <div className="space-y-2"><Label htmlFor="buyer-wallet-amount">Số tiền</Label><Input id="buyer-wallet-amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="buyer-wallet-note">Ghi chú <span className="font-normal text-muted-foreground">(tùy chọn)</span></Label><Input id="buyer-wallet-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Seed balance cho demo" /></div>
            <Button type="submit" disabled={topUp.isPending}>{topUp.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowDownLeft aria-hidden="true" />}Nạp vào Ví Encore</Button>
          </form>
        </AccountSection>

        <section aria-labelledby="buyer-wallet-history"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Audit trail</p><h2 id="buyer-wallet-history" className="mt-2 text-xl font-bold text-foreground">Biến động gần đây</h2></div><p className="text-xs text-muted-foreground">Tự cập nhật mỗi 5 giây</p></div>
          <div className="mt-4 divide-y divide-white/6 rounded-card bg-card px-5 ring-1 ring-white/5 md:px-7">{wallet.transactions.length ? wallet.transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />) : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có biến động nào.</p>}</div>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{formatVND(value)}</p></div>; }

function TransactionRow({ transaction }) {
  const spent = transaction.type === "ORDER_PAYMENT";
  return <div className="flex items-center gap-3 py-4"><span className={`grid size-9 shrink-0 place-items-center rounded-full ${spent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`} aria-hidden="true">{spent ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{TYPE_LABELS[transaction.type] || transaction.type}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{transaction.note || ""} · {formatDateTime(transaction.createdAt)}</p></div><div className={`text-right text-sm font-semibold ${spent ? "text-destructive" : "text-primary"}`}>{spent ? "−" : "+"}{formatVND(transaction.amount)}<p className="text-xs font-normal text-muted-foreground">Dư {formatVND(transaction.balanceAfter)}</p></div></div>;
}

function WalletSkeleton() { return <div role="status" aria-label="Đang tải ví Encore" className="space-y-5"><div className="h-10 w-52 animate-pulse rounded bg-card" /><div className="h-56 animate-pulse rounded-card bg-card" /><div className="h-48 animate-pulse rounded-card bg-card" /></div>; }
