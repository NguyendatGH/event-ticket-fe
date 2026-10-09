import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useGatewayAcquirerConfigs,
  useGatewayMerchant, useGatewayTerminals, useRotateGatewayCredential,
  useSetActiveTerminal, useSetTerminalStatus, useUpdateGatewayMerchant,
} from "@/api";
import { BackLink, Container, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AsyncSection } from "./components/AdminStates";
import { SecretOnce } from "./components/SecretOnce";
import { AddAcquirerForm } from "./components/AddAcquirerForm";
import { CreateTerminalForm } from "./components/CreateTerminalForm";
import { TerminalConfigForm } from "./components/TerminalConfigForm";

export default function MerchantDetailPage() {
  const { merNo } = useParams();
  const merchant = useGatewayMerchant(merNo);
  const terminals = useGatewayTerminals(merNo);
  const configs = useGatewayAcquirerConfigs(merNo);
  const [secret, setSecret] = useState(null);

  const rotate = useRotateGatewayCredential({
    onSuccess: (d) => { setSecret(d?.merchantSecret ?? null); toast.success("Đã rotate credential — binding của Encore đã đồng bộ"); },
    onError: (e) => toast.error(e?.message ?? "Rotate thất bại"),
  });
  const update = useUpdateGatewayMerchant({
    onSuccess: () => toast.success("Đã cập nhật merchant"),
    onError: (e) => toast.error(e?.message ?? "Cập nhật thất bại"),
  });

  const m = merchant.data;
  const suspended = m?.status === "INACTIVE";
  const activeTerminalId = m?.activeTerminalId ?? null;
  const channelTerminalIds = m?.channelTerminalIds ?? [];

  return (
    <Container className="py-10">
      <BackLink to="/gateway-admin/organizers">Ban tổ chức</BackLink>
      <PageHeader eyebrow="GATEWAY MERCHANT" title={m?.name ?? merNo} description={`Gateway Merchant No ${merNo}`} />

      <SecretOnce secret={secret} onDismiss={() => setSecret(null)} />

      <p className="mt-4 text-sm text-muted-foreground">
        Tài khoản nhận tiền của merchant (settlement mặc định):{" "}
        {m?.settlementAccount
          ? <span className="text-foreground">BIN {m.settlementAccount.bankBin} · {m.settlementAccount.accountName ?? "—"} · {m.settlementAccount.accountNumberMasked}</span>
          : <span>chưa khai — doanh thu dừng ở clearing cho tới khi BTC khai</span>}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge variant={suspended ? "secondary" : "default"}>{m?.status ?? "…"}</Badge>
        {m?.externalReference && <span className="font-mono text-xs text-muted-foreground">{m.externalReference}</span>}
        <Button size="sm" variant="secondary" disabled={rotate.isPending} onClick={() => rotate.mutate(merNo)}>
          Rotate credential
        </Button>
        <Button size="sm" variant="secondary" disabled={update.isPending}
          onClick={() => update.mutate({ merNo, status: suspended ? "ACTIVE" : "INACTIVE" })}>
          {suspended ? "Activate merchant" : "Suspend merchant"}
        </Button>
      </div>

      <Readiness terminals={terminals.data} />

      <Tabs defaultValue="terminals" className="mt-8">
        <TabsList>
          <TabsTrigger value="terminals">Terminals</TabsTrigger>
          <TabsTrigger value="acquirers">Acquirer Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="terminals" className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            Điểm chấp nhận thanh toán: web, app, hay quầy POS. Terminal có thể có tài khoản nhận tiền riêng
            (không có thì dùng của merchant). Đơn hàng trên Encore chạy qua các terminal đánh dấu <strong>Kênh của BTC</strong>
            (BTC tự mở ở trang Tài khoản nhận tiền); BTC chưa mở kênh nào thì qua terminal <strong>Encore đang dùng</strong>.
          </p>
          <AsyncSection query={terminals} empty="No terminals configured." rows={2}>
            {(list) => (
              <Accordion type="multiple" className="space-y-2">
                {list.map((t) => (
                  <AccordionItem key={t.terminalId} value={t.terminalId}
                    className="rounded-lg border border-border px-4 last:border-b">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 pr-3 text-left">
                        <span className="font-mono text-sm">{t.terminalId}</span>
                        <span className="text-sm font-medium">{t.name}</span>
                        <Badge variant={t.status === "ACTIVE" ? "default" : "secondary"}>{t.status}</Badge>
                        {t.terminalId === activeTerminalId && <Badge>Encore đang dùng</Badge>}
                        {channelTerminalIds.includes(t.terminalId) && <Badge variant="info">Kênh của BTC</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {t.channel} · {t.currency} · 3DS {t.threeDsPolicy ?? "—"} · {t.routingProfileCode ?? "—"}
                          {" · "}{(t.paymentMethods ?? []).join(", ") || "chưa bật phương thức nào"}
                          {t.settlementAccount && ` · tiền về BIN ${t.settlementAccount.bankBin} ${t.settlementAccount.accountNumberMasked}`}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-5">
                      <TerminalActions terminal={t} merNo={merNo} activeTerminalId={activeTerminalId}
                        isChannel={channelTerminalIds.includes(t.terminalId)}
                        onDone={() => { terminals.refetch(); merchant.refetch(); }} />
                      <TerminalConfigForm terminal={t} onSaved={() => terminals.refetch()} />
                      <Link className="mt-4 inline-block text-xs text-muted-foreground underline"
                        to={`/gateway-admin/terminals/${t.terminalId}`}>
                        Mở trang riêng của terminal này
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </AsyncSection>
          <CreateTerminalForm merNo={merNo} activeTerminalId={activeTerminalId} />
        </TabsContent>

        <TabsContent value="acquirers" className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            Hợp đồng của merchant với ngân hàng thu hộ. MID/TID do acquirer cấp —{" "}
            <strong>khác</strong> Gateway Merchant No và Gateway Terminal ID.
          </p>
          <AsyncSection query={configs} empty="No acquirer connections." rows={2}>
            {(list) => (
              <ul className="space-y-2">
                {list.map((c) => (
                  <li key={c.acquirerCode} className="rounded-lg border border-border p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono">{c.acquirerCode}</span>
                      <Badge variant="secondary">{c.status}</Badge>
                      <span className="text-xs text-muted-foreground">{c.acquirerName} · nhận {c.paymentMethods?.join(", ") || "—"}</span>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>Acquirer Merchant ID (MID): <span className="font-mono">{c.mid ?? "—"}</span></span>
                      <span>Acquirer Terminal ID (TID): <span className="font-mono">{c.tid ?? "—"}</span></span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AsyncSection>
          <AddAcquirerForm merNo={merNo} terminals={terminals.data} />
        </TabsContent>
      </Tabs>
    </Container>
  );
}

function Readiness({ terminals }) {
  if (!Array.isArray(terminals) || terminals.length === 0) return null;
  const problems = terminals
    .filter((t) => t.status === "ACTIVE" && t.routableMethods)
    .map((t) => ({ id: t.terminalId, hidden: (t.paymentMethods ?? []).filter((m) => !t.routableMethods.includes(m)) }))
    .filter((t) => t.hidden.length > 0);
  return problems.length === 0 ? (
    <p className="mt-4 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
      Mọi phương thức đã bật trên các terminal đang chạy đều có route dùng được.
    </p>
  ) : (
    <p role="status" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
      {problems.length} terminal có phương thức khách <strong>không thấy</strong>:{" "}
      {problems.map((t) => `${t.id} (${t.hidden.join(", ")})`).join("; ")}. Mở terminal bên dưới, xem cột "Khách thấy?".
    </p>
  );
}

/**
 * Hai việc khác nhau, cố ý tách làm hai nút:
 *   Chuyển sang dùng  = đổi terminal Encore thu tiền qua (sửa binding bên Encore)
 *   Tắt / Bật         = trạng thái của chính terminal trên gateway
 * Tắt terminal đang được dùng bị BE chặn (TERMINAL_IN_USE) nên nút đó disable luôn cho khỏi bấm nhầm.
 */
function TerminalActions({ terminal, merNo, activeTerminalId, isChannel = false, onDone }) {
  const inUse = terminal.terminalId === activeTerminalId;
  const off = terminal.status !== "ACTIVE";

  const setActive = useSetActiveTerminal({
    onSuccess: () => { toast.success(`Encore sẽ thu tiền qua ${terminal.terminalId}`); onDone(); },
    onError: (e) => toast.error(e?.message ?? "Không chuyển được"),
  });
  const setStatus = useSetTerminalStatus({
    onSuccess: (_d, v) => { toast.success(v.status === "ACTIVE" ? "Đã bật terminal" : "Đã tắt terminal"); onDone(); },
    onError: (e) => toast.error(e?.message ?? "Không đổi được trạng thái"),
  });
  const busy = setActive.isPending || setStatus.isPending;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <Button size="sm" variant="secondary" disabled={busy || inUse || off}
        onClick={() => setActive.mutate({ merNo, terminalId: terminal.terminalId })}>
        {inUse ? "Đang dùng cho Encore" : "Chuyển sang dùng terminal này"}
      </Button>
      <Button size="sm" variant="secondary" disabled={busy || ((inUse || isChannel) && !off)}
        onClick={() => setStatus.mutate({ merNo, terminalId: terminal.terminalId, status: off ? "ACTIVE" : "INACTIVE" })}>
        {off ? "Bật terminal" : "Tắt terminal"}
      </Button>
      <span className="text-xs text-muted-foreground">
        {isChannel && !off
          ? "Là kênh nhận tiền ban tổ chức đang mở — họ phải xóa kênh trước rồi mới tắt được."
          : inUse
          ? "Đang nhận đơn của ban tổ chức này — chuyển sang terminal khác rồi mới tắt được."
          : off
            ? "Đang tắt: mọi lệnh thu tiền qua terminal này bị gateway từ chối."
            : "Bật nhưng Encore chưa dùng — không có đơn nào chạy qua đây."}
      </span>
    </div>
  );
}
