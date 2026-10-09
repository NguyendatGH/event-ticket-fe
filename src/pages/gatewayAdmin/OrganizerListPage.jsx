import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useGatewayOrganizers, useProvisionOrganizer } from "@/api";
import { Container, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AsyncSection } from "./components/AdminStates";

export default function OrganizerListPage() {
  const query = useGatewayOrganizers();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  const provision = useProvisionOrganizer({
    onSuccess: (row) => toast.success(`${row.organizerName} → ${row.gatewayMerchantNo} / ${row.gatewayTerminalId}`),
    onError: (e) => toast.error(e?.message ?? "Cấp phát thất bại"),
    onSettled: () => setBusy(null),
  });

  const gatewayUp = query.data?.gatewayReachable !== false;
  const rows = useMemo(() => {
    const all = query.data?.organizers ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => `${r.organizerName} ${r.gatewayMerchantNo ?? ""} ${r.contactEmail ?? ""}`.toLowerCase().includes(q));
  }, [query.data, search]);

  const pending = rows.filter((r) => r.needsProvisioning).length;

  return (
    <Container className="py-10">
      <PageHeader eyebrow="BANKSIM GATEWAY ADMIN" title="cấu hình thanh toán cho merchant trên gateway "
        description="cấu hình thanh toán (terminal) cho mỗi merchant trên trang này)." />

      {query.isSuccess && !gatewayUp && (
        <p className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
          <strong className="text-destructive">Không kết nối được gateway.</strong>{" "}
          Danh sách bên dưới lấy từ dữ liệu của Encore nên vẫn đúng, nhưng <strong>số terminal không kiểm tra được</strong>
          {" "}(hiện dấu <code>?</code>) và <strong>không cấp phát được</strong> cho tới khi gateway chạy lại.
        </p>
      )}

      {gatewayUp && pending > 0 && (
        <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {pending} ban tổ chức <strong>chưa có merchant trên gateway</strong> — khách mua vé của họ sẽ lỗi
          <code className="mx-1">GATEWAY_MERCHANT_NOT_PROVISIONED</code>. BTC tự khai tài khoản nhận tiền là được cấp phát;
          muốn làm hộ thì bấm <em>Cấp phát</em> ở dòng tương ứng.
        </p>
      )}

      <div className="mt-6">
        <Input placeholder="Tìm theo tên BTC, Gateway Merchant No, email…" value={search}
          onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="mt-4 overflow-x-auto">
        <AsyncSection query={query} empty="Chưa có ban tổ chức nào." rows={5}>
          {() =>
            rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Không khớp từ khoá nào.</p>
            ) : (
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Ban tổ chức</th>
                    <th className="py-2 pr-4">Tài khoản nhận tiền</th>
                    <th className="py-2 pr-4">Gateway Merchant No</th>
                    <th className="py-2 pr-4">Terminals</th>
                    <th className="py-2 pr-4">Trạng thái</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.organizerId} className="border-b border-border/60">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.organizerName}</div>
                        {r.contactEmail && <div className="text-xs text-muted-foreground">{r.contactEmail}</div>}
                      </td>
                      <td className="py-3 pr-4">
                        {r.payoutAccount
                          ? <span className="text-sm">{r.payoutAccount}</span>
                          : <span className="text-xs text-muted-foreground">chưa khai</span>}
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        {r.gatewayMerchantNo
                          ? <Link className="underline underline-offset-4" to={`/gateway-admin/merchants/${r.gatewayMerchantNo}`}>{r.gatewayMerchantNo}</Link>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        {r.gatewayMerchantNo == null ? "—"
                          : r.terminalCount == null
                            ? <span title="Không hỏi được gateway" className="text-muted-foreground">?</span>
                            : r.terminalCount}
                      </td>
                      <td className="py-3 pr-4">
                        {r.bindingStatus
                          ? <Badge variant={r.bindingStatus === "ACTIVE" ? "default" : "secondary"}>{r.bindingStatus}</Badge>
                          : <span className="text-xs text-muted-foreground">chưa cấp phát</span>}
                        {r.provisioningError && (
                          <div className="mt-1 max-w-xs text-xs text-destructive">{r.provisioningError}</div>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {r.needsProvisioning ? (
                          <Button size="sm" disabled={busy === r.organizerId || !gatewayUp}
                            title={gatewayUp ? undefined : "Gateway đang không kết nối được"}
                            onClick={() => { setBusy(r.organizerId); provision.mutate(r.organizerId); }}>
                            {busy === r.organizerId ? "Đang cấp phát…" : "Cấp phát"}
                          </Button>
                        ) : r.gatewayMerchantNo ? (
                          <Link className="text-sm underline underline-offset-4" to={`/gateway-admin/merchants/${r.gatewayMerchantNo}`}>
                            Cấu hình
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </AsyncSection>
      </div>
    </Container>
  );
}
