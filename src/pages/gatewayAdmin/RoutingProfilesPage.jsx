// §15 — Routing profile là tầng trung gian giữa terminal và acquirer:
//   Terminal → RoutingProfile → RoutingRule(method, priority) → Acquirer
// Terminal không bao giờ trỏ thẳng vào acquirer, nên đổi bank = đổi rule, không phải sửa terminal.
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddRoutingRule, useCreateRoutingProfile, useGatewayAcquirers,
  useGatewayRoutingProfile, useGatewayRoutingProfiles,
} from "@/api";
import { Container, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AsyncSection } from "./components/AdminStates";

const METHODS = ["CARD", "QR", "PAYNOW", "GOOGLE_PAY", "APPLE_PAY"];

export default function RoutingProfilesPage() {
  const query = useGatewayRoutingProfiles();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const create = useCreateRoutingProfile({
    onSuccess: (p) => { setCode(""); setName(""); toast.success(`Đã tạo profile ${p?.code ?? ""}`); },
    onError: (e) => toast.error(e?.message ?? "Tạo profile thất bại"),
  });

  return (
    <Container className="py-10">
      <PageHeader eyebrow="BANKSIM GATEWAY ADMIN" title="Routing Profiles"
        description="Quyết định giao dịch của phương thức nào đi qua acquirer nào, theo thứ tự ưu tiên." />

      <p className="mt-4 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
        Terminal chỉ trỏ vào <strong>profile</strong>, không trỏ thẳng vào acquirer. Muốn terminal nhận QR thì
        profile của nó phải có rule cho QR — thiếu là <code>409 ROUTING_NOT_CONFIGURED</code>.
      </p>

      <form
        className="mt-6 grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => { e.preventDefault(); if (code.trim() && name.trim()) create.mutate({ code: code.trim(), name: name.trim() }); }}
      >
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="rp-code">Mã profile</label>
          <Input id="rp-code" value={code} placeholder="CARD_AND_QR"
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="rp-name">Tên hiển thị</label>
          <Input id="rp-name" value={name} placeholder="Thẻ và QR" onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={create.isPending || !code.trim() || !name.trim()}>+ Tạo profile</Button>
        </div>
      </form>

      <div className="mt-6">
        <AsyncSection query={query} empty="Chưa có routing profile nào." rows={3}>
          {(list) => (
            <Accordion type="multiple" className="space-y-2">
              {list.map((p) => (
                <AccordionItem key={p.code} value={p.code} className="rounded-lg border border-border px-4 last:border-b">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 flex-wrap items-center gap-3 pr-3 text-left">
                      <span className="font-mono text-sm">{p.code}</span>
                      <span className="text-sm">{p.name}</span>
                      <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>{p.status}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-5">
                    <ProfileRules code={p.code} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </AsyncSection>
      </div>
    </Container>
  );
}

function ProfileRules({ code }) {
  const detail = useGatewayRoutingProfile(code);
  const acquirers = useGatewayAcquirers();
  const list = Array.isArray(acquirers.data) ? acquirers.data : [];
  const [method, setMethod] = useState("CARD");
  const [acquirer, setAcquirer] = useState("");
  const [priority, setPriority] = useState("1");

  const add = useAddRoutingRule({
    onSuccess: () => { setAcquirer(""); toast.success("Đã thêm rule"); detail.refetch(); },
    onError: (e) => toast.error(e?.message ?? "Thêm rule thất bại"),
  });

  const routes = detail.data?.routes ?? {};
  const hasRoutes = Object.keys(routes).length > 0;

  return (
    <div className="space-y-4">
      {detail.isPending ? (
        <p className="text-sm text-muted-foreground">Đang tải rule…</p>
      ) : !hasRoutes ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
          Profile này chưa có rule nào — terminal dùng nó sẽ không thanh toán được.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(routes).map(([m, rs]) => (
            <div key={m} className="rounded-lg border border-border p-3 text-sm">
              <strong>{m}</strong>
              <ol className="ml-5 list-decimal text-muted-foreground">
                {rs.map((r) => <li key={r.priority}>{r.acquirerCode}</li>)}
              </ol>
            </div>
          ))}
        </div>
      )}

      <form
        className="grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!acquirer) return;
          add.mutate({ code, paymentMethod: method, acquirerCode: acquirer, priority: Number(priority) || 1 });
        }}
      >
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor={`m-${code}`}>Phương thức</label>
          <Select value={method} onValueChange={(v) => { setMethod(v); setAcquirer(""); }}>
            <SelectTrigger id={`m-${code}`}><SelectValue /></SelectTrigger>
            <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor={`a-${code}`}>Acquirer</label>
          <Select value={acquirer} onValueChange={setAcquirer}>
            <SelectTrigger id={`a-${code}`}><SelectValue placeholder="Chọn acquirer" /></SelectTrigger>
            <SelectContent>
              {list.map((a) => {
                // Route tới acquirer không nhận method này sẽ bị gateway từ chối (ACQUIRER_METHOD_NOT_SUPPORTED).
                const accepted = a.paymentMethods ?? [];
                const runs = a.status === "ACTIVE" && accepted.includes(method);
                const why = a.status !== "ACTIVE" ? "đang tắt" : `chỉ nhận ${accepted.join(", ") || "—"}`;
                return (
                  <SelectItem key={a.code} value={a.code} disabled={!runs}>
                    {a.code} — {accepted.join(", ")}{runs ? "" : ` (${why})`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor={`p-${code}`}>Ưu tiên</label>
          <Input id={`p-${code}`} type="number" min={1} className="w-24" value={priority}
            onChange={(e) => setPriority(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={add.isPending || !acquirer}>+ Thêm rule</Button>
        </div>
        <p className="col-span-full text-xs text-muted-foreground">
          Chỉ chọn được acquirer có nhận phương thức đó (khai ở trang Acquirers).
          Ưu tiên nhỏ hơn được thử trước; trùng ưu tiên trong cùng phương thức sẽ bị từ chối.
        </p>
      </form>
    </div>
  );
}
