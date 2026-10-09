// Form cấu hình terminal, dùng chung cho sửa-tại-chỗ ở trang merchant và trang terminal riêng.
// Methods + 3DS + routing gửi trong MỘT request: gateway kiểm trên trạng thái cuối nên không còn "lưu một phần".
// Trước đây ba thứ là ba request rời, gọi methods trước: tick QR + đổi sang profile có rule QR thì methods bị
// kiểm theo profile CŨ (409 ROUTING_NOT_CONFIGURED), còn bỏ CARD thì bị 3DS cũ chặn (CARD_NOT_ENABLED).
import { useState } from "react";
import { toast } from "sonner";
import { useConfigureTerminal, useGatewayAcquirers, useGatewayRoutingProfile, useGatewayRoutingProfiles } from "@/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardRoutesWithout3ds } from "../lib";

const METHODS = ["CARD", "QR", "PAYNOW", "GOOGLE_PAY", "APPLE_PAY"];
const POLICIES = ["REQUIRED", "OPTIONAL", "DISABLED"];
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

export function TerminalConfigForm({ terminal, onSaved }) {
  const profiles = useGatewayRoutingProfiles();
  const profileList = Array.isArray(profiles.data) ? profiles.data : [];
  const base = {
    methods: terminal.paymentMethods ?? [],
    policy: terminal.threeDsPolicy ?? "",
    profile: terminal.routingProfileCode ?? "",
    // Ban tổ chức tự chọn ngân hàng ở trang "Tài khoản nhận tiền": terminal đi thẳng một ngân hàng, không theo profile.
    bank: terminal.acquirerCode ?? "",
  };
  const [draft, setDraft] = useState(null);
  const form = draft ?? base;
  const patch = (next) => setDraft({ ...form, ...next });

  // Rule của profile ĐANG CHỌN (không phải profile đang lưu), để báo thiếu route trước khi bấm Lưu.
  const selected = useGatewayRoutingProfile(form.profile);
  const saved = form.profile === base.profile ? terminal.routingProfile?.routes : undefined;
  const loaded = selected.data?.routes ?? saved;
  const routes = loaded ?? {};
  const unrouted = form.profile && loaded ? form.methods.filter((m) => !routes[m]?.length) : [];
  // Gateway trả routableMethods = method đã tick VÀ còn route dùng được. Lệch nhau nghĩa là admin đã tắt acquirer,
  // bỏ method khỏi acquirer… sau lúc lưu terminal: method vẫn tick nhưng khách KHÔNG thấy.
  const hidden = terminal.routableMethods
    ? (terminal.paymentMethods ?? []).filter((m) => !terminal.routableMethods.includes(m))
    : [];

  const hasCard = form.methods.includes("CARD");
  // 3DS chỉ có nghĩa với CARD. Không bật CARD thì gửi null; gateway từ chối policy khác DISABLED khi thiếu CARD.
  const policy = hasCard ? form.policy || null : null;
  const acquirers = useGatewayAcquirers();
  const no3ds = cardRoutesWithout3ds({ methods: form.methods, policy, routes, acquirers: acquirers.data });
  const configure = useConfigureTerminal();
  const terminalId = terminal.terminalId;
  const dirty = !same(form.methods, base.methods) || (policy ?? "") !== base.policy || form.profile !== base.profile;
  // Không chọn profile nào mà terminal đang theo ngân hàng BTC chọn: lưu là giữ nguyên ngân hàng đó.
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
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Payment methods</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {METHODS.map((m) => (
            <label key={m} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <Checkbox checked={form.methods.includes(m)} onCheckedChange={(on) =>
                patch({ methods: on ? [...form.methods, m] : form.methods.filter((x) => x !== m) })} />
              {m}
            </label>
          ))}
        </div>
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
          Merchant cũng phải có Acquirer Connection tới acquirer của rule đó.
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
          Đang tick nhưng khách <strong>không thấy</strong>: {hidden.join(", ")}. Không còn route dùng được — acquirer
          của route đang tắt, không nhận phương thức này hoặc không có 3DS trong khi terminal bắt buộc 3DS, hoặc merchant
          chưa có Acquirer Connection.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={configure.isPending || !dirty || invalid}>Lưu thay đổi</Button>
        {dirty && <button type="button" className="text-sm underline" onClick={() => setDraft(null)}>Hoàn tác</button>}
      </div>
    </div>
  );
}
