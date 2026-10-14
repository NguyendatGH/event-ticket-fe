import { useState } from "react";
import { toast } from "sonner";
import {
  useConfigureTerminal, useGatewayAcquirerConfigs, useGatewayAcquirers, useGatewayRoutingProfile, useGatewayRoutingProfiles,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardRoutesWithout3ds, methodPaths } from "../lib";
import { MethodRoutes } from "./MethodRoutes";

const POLICIES = ["REQUIRED", "OPTIONAL", "DISABLED"];
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

export function TerminalConfigForm({ terminal, onSaved }) {
  const profiles = useGatewayRoutingProfiles();
  const profileList = Array.isArray(profiles.data) ? profiles.data : [];
  const base = {
    methods: terminal.paymentMethods ?? [],
    policy: terminal.threeDsPolicy ?? "",
    profile: terminal.routingProfileCode ?? "",
    bank: terminal.acquirerCode ?? "",
  };
  const [draft, setDraft] = useState(null);
  const form = draft ?? base;
  const patch = (next) => setDraft({ ...form, ...next });

  const selected = useGatewayRoutingProfile(form.profile);
  const saved = form.profile === base.profile ? terminal.routingProfile?.routes : undefined;
  const loaded = selected.data?.routes ?? saved;
  const routes = loaded ?? {};
  const unrouted = form.profile && loaded ? form.methods.filter((m) => !routes[m]?.length) : [];
  const hidden = terminal.routableMethods
    ? (terminal.paymentMethods ?? []).filter((m) => !terminal.routableMethods.includes(m))
    : [];

  const hasCard = form.methods.includes("CARD");
  const policy = hasCard ? form.policy || null : null;
  const acquirers = useGatewayAcquirers();
  const no3ds = cardRoutesWithout3ds({ methods: form.methods, policy, routes, acquirers: acquirers.data });
  const configs = useGatewayAcquirerConfigs(terminal.merNo);
  const paths = methodPaths({
    methods: form.methods, policy, routes, acquirers: acquirers.data, connections: configs.data,
    bank: !form.profile && base.bank ? base.bank : null,
  });
  const toggle = (method, on) =>
    patch({ methods: on ? [...new Set([...form.methods, method])] : form.methods.filter((x) => x !== method) });
  const configure = useConfigureTerminal();
  const terminalId = terminal.terminalId;
  const dirty = !same(form.methods, base.methods) || (policy ?? "") !== base.policy || form.profile !== base.profile;
  const keepsBank = !form.profile && Boolean(base.bank);
  const invalid = !form.methods.length || (!form.profile && !keepsBank) || (hasCard && !form.policy);

  const save = () => configure.mutate(
    keepsBank
      ? { terminalId, paymentMethods: form.methods, threeDsPolicy: policy, routingProfileCode: null, acquirerCode: base.bank }
      : { terminalId, paymentMethods: form.methods, threeDsPolicy: policy, routingProfileCode: form.profile },
    {
      onSuccess: () => {
        toast.success("Đã lưu cấu hình terminal");
        setDraft(null);
        onSaved?.();
      },
      onError: (e) => toast.error(e?.message ?? "Lưu cấu hình thất bại"),
    },
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Payment methods và đường đi</p>
        <MethodRoutes merNo={terminal.merNo} paths={paths} onToggle={toggle} />
        {!form.methods.length && <p className="mt-2 text-sm text-destructive">Bật ít nhất một phương thức.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground" htmlFor={`p-${terminalId}`}>
            3D Secure Policy
          </label>
          <Select value={hasCard ? form.policy : ""} onValueChange={(v) => patch({ policy: v })} disabled={!hasCard}>
            <SelectTrigger id={`p-${terminalId}`}>
              <SelectValue placeholder={hasCard ? "Chọn policy" : "Không áp dụng (chưa bật CARD)"} />
            </SelectTrigger>
            <SelectContent>{POLICIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          {hasCard && !form.policy && <p className="mt-1 text-sm text-destructive">Chọn 3D Secure policy cho CARD.</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground" htmlFor={`r-${terminalId}`}>
            Routing Profile
          </label>
          <Select value={form.profile} onValueChange={(v) => patch({ profile: v })}>
            <SelectTrigger id={`r-${terminalId}`}>
              <SelectValue placeholder={base.bank ? `Ngân hàng BTC chọn: ${base.bank}` : "Chọn profile"} />
            </SelectTrigger>
            <SelectContent>
              {profileList.map((p) => <SelectItem key={p.code} value={p.code}>{p.code} — {p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {base.bank && (
        <p role="status" className="rounded-lg border border-border px-3 py-2 text-sm">
          Ban tổ chức đã tự chọn ngân hàng <strong>{base.bank}</strong>: mọi phương thức đi thẳng ngân hàng này, không
          failover. {form.profile ? `Lưu sẽ chuyển terminal sang profile ${form.profile} và bỏ lựa chọn của BTC.`
            : "Chọn một routing profile sẽ thay lựa chọn đó."}
        </p>
      )}
      {Object.keys(routes).length > 0 && (
        <div className="rounded-lg border border-border p-3 text-sm">
          <p className="text-xs uppercase text-muted-foreground">Thứ tự fallback của {form.profile}</p>
          {Object.entries(routes).map(([method, rs]) => (
            <div key={method} className="mt-2">
              <strong>{method}</strong>
              <ol className="ml-5 list-decimal text-muted-foreground">
                {rs.map((r) => <li key={r.priority}>{r.acquirerCode}</li>)}
              </ol>
            </div>
          ))}
        </div>
      )}
      {unrouted.length > 0 && (
        <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive">
          Profile {form.profile} chưa có rule cho {unrouted.join(", ")}. Thêm rule ở trang Routing Profiles hoặc chọn profile khác.
        </p>
      )}
      {no3ds.length > 0 && (
        <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive">
          3DS đang là REQUIRED nhưng route CARD của {form.profile} chỉ tới {no3ds.join(", ")}, không acquirer nào có 3DS.
          Chọn profile có acquirer hỗ trợ 3DS, hoặc để 3DS OPTIONAL.
        </p>
      )}

      {hidden.length > 0 && (
        <p role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          Đang tick nhưng khách <strong>không thấy</strong>: {hidden.join(", ")}. Xem cột "Khách thấy?" ở bảng trên để biết
          thiếu bước nào (rule, acquirer không nhận, merchant chưa nối hoặc thiếu 3DS).
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={configure.isPending || !dirty || invalid}>Lưu thay đổi</Button>
        {dirty && <button type="button" className="text-sm underline" onClick={() => setDraft(null)}>Hoàn tác</button>}
      </div>
    </div>
  );
}
