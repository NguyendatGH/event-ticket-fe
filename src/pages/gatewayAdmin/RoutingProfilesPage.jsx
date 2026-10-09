import { useState } from "react";
import { toast } from "sonner";
import {
  useAddRoutingRule, useCreateRoutingProfile, useGatewayAcquirers,
  useGatewayRoutingProfile, useGatewayRoutingProfileDetails, useGatewayRoutingProfiles,
} from "@/api";
import { Container, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AsyncSection } from "./components/AdminStates";
import { METHOD_LABEL, PAYMENT_METHODS, routeChain } from "./lib";

const PROBLEM_TEXT = {
  missing: "không còn tồn tại",
  inactive: "đang tắt",
  unsupported: "không nhận phương thức này",
};

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
        Terminal chỉ trỏ vào <strong>profile</strong>, không trỏ thẳng vào acquirer. Muốn terminal nhận Google Pay thì
        profile của nó phải có rule cho Google Pay — thiếu là <code>409 ROUTING_NOT_CONFIGURED</code>. Trong mỗi phương
        thức, acquirer ở <strong>vị trí 1 được thử trước</strong>; lỗi thì chuyển sang vị trí 2 (failover).
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
          {(list) => <ProfileList list={list} />}
        </AsyncSection>
      </div>
    </Container>
  );
}

function ProfileList({ list }) {
  const details = useGatewayRoutingProfileDetails(list.map((p) => p.code));
  return (
    <Accordion type="multiple" className="space-y-2">
      {list.map((p, i) => {
        const routes = details[i]?.data?.routes;
        const covered = routes ? PAYMENT_METHODS.filter((m) => routes[m]?.length) : null;
        return (
          <AccordionItem key={p.code} value={p.code} className="rounded-lg border border-border px-4 last:border-b">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 pr-3 text-left">
                <span className="font-mono text-sm">{p.code}</span>
                <span className="text-sm">{p.name}</span>
                <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>{p.status}</Badge>
                {covered && (covered.length > 0
                  ? <span className="text-xs text-muted-foreground">route: {covered.map((m) => METHOD_LABEL[m]).join(" · ")}</span>
                  : <Badge variant="destructive">chưa có rule</Badge>)}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-5">
              <ProfileRules code={p.code} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function ProfileRules({ code }) {
  const detail = useGatewayRoutingProfile(code);
  const acquirers = useGatewayAcquirers();
  const routes = detail.data?.routes ?? {};

  if (detail.isPending) return <p className="text-sm text-muted-foreground">Đang tải rule…</p>;
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border">
        <div className="hidden grid-cols-[8rem_1fr_16rem] gap-3 border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground sm:grid">
          <span>Phương thức</span>
          <span>Thứ tự thử (failover)</span>
          <span>Thêm acquirer</span>
        </div>
        {PAYMENT_METHODS.map((m) => (
          <MethodRuleRow key={m} code={code} method={m} routes={routes} acquirers={acquirers.data} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Chỉ chọn được acquirer đang bật và có nhận phương thức đó (khai ở trang Acquirers). Thứ tự ưu tiên tự gán theo
        thứ tự thêm. Chưa có thao tác xoá hay đổi thứ tự rule.
      </p>
    </div>
  );
}

function MethodRuleRow({ code, method, routes, acquirers }) {
  const { chain, nextPriority } = routeChain({ routes, method, acquirers });
  const [pick, setPick] = useState("");
  const add = useAddRoutingRule({
    onSuccess: () => { setPick(""); toast.success(`Đã thêm rule ${METHOD_LABEL[method]}`); },
    onError: (e) => toast.error(e?.message ?? "Thêm rule thất bại"),
  });
  const eligible = (Array.isArray(acquirers) ? acquirers : []).filter((a) =>
    a.status === "ACTIVE" && (a.paymentMethods ?? []).includes(method) && !chain.some((c) => c.code === a.code));

  return (
    <div className="grid items-start gap-2 border-b border-border px-3 py-3 text-sm last:border-b-0 sm:grid-cols-[8rem_1fr_16rem] sm:gap-3">
      <span className="font-medium">{METHOD_LABEL[method]}</span>

      <div>
        {chain.length === 0 ? (
          <p className="text-muted-foreground">Chưa có rule — terminal dùng profile này không nhận được {METHOD_LABEL[method]}.</p>
        ) : (
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {chain.map((c, i) => (
              <li key={c.code} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-muted-foreground">→</span>}
                <span className="text-xs text-muted-foreground">{i + 1}.</span>
                <span className="font-mono">{c.code}</span>
                {c.problem && <span className="text-xs text-destructive">({PROBLEM_TEXT[c.problem]})</span>}
              </li>
            ))}
          </ol>
        )}
      </div>

      <form className="flex gap-2" onSubmit={(e) => {
        e.preventDefault();
        if (pick) add.mutate({ code, paymentMethod: method, acquirerCode: pick, priority: nextPriority });
      }}>
        <Select value={pick} onValueChange={setPick} disabled={eligible.length === 0}>
          <SelectTrigger aria-label={`Thêm acquirer cho ${METHOD_LABEL[method]} của ${code}`} className="min-w-0 flex-1">
            <SelectValue placeholder={eligible.length ? "Chọn acquirer" : "Không còn acquirer phù hợp"} />
          </SelectTrigger>
          <SelectContent>
            {eligible.map((a) => <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={add.isPending || !pick}>Thêm</Button>
      </form>
    </div>
  );
}
