// Trang riêng cho một terminal — chủ yếu để chia sẻ link. Việc cấu hình thường ngày làm
// ngay tại trang merchant (sửa tại chỗ), dùng chung TerminalConfigForm nên không lệch logic.
import { useParams } from "react-router-dom";
import { useGatewayTerminal } from "@/api";
import { BackLink, Container, PageHeader } from "@/components/site";
import { Badge } from "@/components/ui/badge";
import { AsyncSection } from "./components/AdminStates";
import { TerminalConfigForm } from "./components/TerminalConfigForm";

export default function TerminalConfigPage() {
  const { terminalId } = useParams();
  const query = useGatewayTerminal(terminalId);
  const t = query.data;

  return (
    <Container className="py-10">
      <BackLink to={t?.merNo ? `/gateway-admin/merchants/${t.merNo}` : "/gateway-admin/organizers"}>
        {t?.merNo ?? "Merchant"}
      </BackLink>
      <PageHeader eyebrow="TERMINAL CONFIGURATION" title={terminalId}
        description={t ? `Gateway Merchant No ${t.merNo}` : " "} />

      <AsyncSection query={query} empty="Không tìm thấy terminal.">
        {() => (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3 text-sm">
              <Badge variant={t.status === "ACTIVE" ? "default" : "secondary"}>{t.status}</Badge>
              <span>Channel <strong>{t.channel}</strong></span>
              <span>Currency <strong>{t.currency}</strong></span>
            </div>
            <TerminalConfigForm terminal={t} onSaved={() => query.refetch()} />
            <p className="text-xs text-muted-foreground">
              Acquirer connections (MID/TID) cấu hình ở trang merchant, không thuộc terminal.
            </p>
          </div>
        )}
      </AsyncSection>
    </Container>
  );
}
