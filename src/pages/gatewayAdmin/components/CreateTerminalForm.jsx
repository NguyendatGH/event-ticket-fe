// Tạo terminal: chọn luôn phương thức + 3DS + routing, gateway kiểm trên đúng cấu hình đó (thiếu rule, thiếu
// Acquirer Connection, acquirer không nhận method… đều bị từ chối kèm lý do). Trước đây form gắn cứng CARD + 3DS
// OPTIONAL nên không tạo được terminal có QR (hay chỉ QR) trong một bước.
// Mỗi BTC chỉ thu tiền qua MỘT terminal. Ô "Encore dùng terminal này ngay" (mặc định bật) gắn luôn terminal mới vào
// BTC; trước đây tạo xong vẫn thu qua terminal cũ, admin tạo terminal có QR mà khách chỉ thấy thẻ. Bỏ tick = chỉ tạo,
// đổi sau bằng "Chuyển sang dùng terminal này". Toast nói theo usedByEncore server trả về, không đoán.
import { useState } from "react";
import { toast } from "sonner";
import { useCreateGatewayTerminal, useGatewayAcquirers, useGatewayRoutingProfile, useGatewayRoutingProfiles } from "@/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cardRoutesWithout3ds } from "../lib";

const CHANNELS = ["WEB", "MOBILE_APP", "API", "POS"];
const METHODS = ["CARD", "QR", "PAYNOW", "GOOGLE_PAY", "APPLE_PAY"];
const POLICIES = ["REQUIRED", "OPTIONAL", "DISABLED"];

export function CreateTerminalForm({ merNo, activeTerminalId }) {
  const profiles = useGatewayRoutingProfiles();
  const list = Array.isArray(profiles.data) ? profiles.data : [];
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("WEB");
  const [currency, setCurrency] = useState("VND");
  const [profile, setProfile] = useState("");
  const [methods, setMethods] = useState(["CARD"]);
  const [policy, setPolicy] = useState("OPTIONAL");
  const [activate, setActivate] = useState(true);
  const selected = useGatewayRoutingProfile(profile);
  const routes = selected.data?.routes;
  const unrouted = profile && routes ? methods.filter((m) => !routes[m]?.length) : [];
  const hasCard = methods.includes("CARD");
  const acquirers = useGatewayAcquirers();
  const no3ds = cardRoutesWithout3ds({ methods, policy, routes, acquirers: acquirers.data });
  // Merchant chưa gắn BTC nào thì không có gì để "dùng ngay".
  const linked = Boolean(activeTerminalId);

  const create = useCreateGatewayTerminal({
    onSuccess: (t) => {
      setName("");
      const id = t?.terminalId ?? "terminal";
      toast.success(t?.usedByEncore
        ? `Đã tạo ${id}. Encore thu tiền qua terminal này từ giờ.`
        : activeTerminalId
          ? `Đã tạo ${id}. Encore vẫn thu tiền qua ${activeTerminalId} — bấm "Chuyển sang dùng terminal này" để khách dùng terminal mới.`
          : `Đã tạo ${id}.`);
    },
    // Gateway trả code thật (ROUTING_NOT_CONFIGURED, ACQUIRER_NOT_CONFIGURED…) — hiện nguyên văn.
    onError: (e) => toast.error(e?.message ?? "Tạo terminal thất bại"),
  });
  const valid = name.trim() && profile && methods.length > 0 && (!hasCard || policy);

  return (
    <form
      className="mt-6 grid gap-4 rounded-lg border border-dashed border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        // 3DS chỉ có nghĩa với CARD: không bật CARD thì gửi null, gateway từ chối policy khác DISABLED khi thiếu CARD.
        create.mutate({ merNo, activate: linked && activate, name: name.trim(), channel, currency,
          paymentMethods: methods, threeDsPolicy: hasCard ? policy : null, routingProfileCode: profile });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_1fr]">
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="t-name">Terminal Name / Label</label>
          <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Checkout" required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="t-channel">Channel</label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger id="t-channel" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="t-ccy">Currency</label>
          <Input id="t-ccy" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))} className="w-24" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="t-profile">Routing Profile (bắt buộc)</label>
          <Select value={profile} onValueChange={setProfile}>
            <SelectTrigger id="t-profile"><SelectValue placeholder="Chọn profile" /></SelectTrigger>
            <SelectContent>
              {list.map((p) => <SelectItem key={p.code} value={p.code}>{p.code} — {p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium">Payment methods</p>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <label key={m} htmlFor={`new-${m}`} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <Checkbox id={`new-${m}`} checked={methods.includes(m)}
                onCheckedChange={(on) => setMethods(on ? [...methods, m] : methods.filter((x) => x !== m))} />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div className="max-w-xs">
        <label className="mb-1 block text-xs font-medium" htmlFor="t-3ds">3D Secure Policy</label>
        <Select value={hasCard ? policy : ""} onValueChange={setPolicy} disabled={!hasCard}>
          <SelectTrigger id="t-3ds"><SelectValue placeholder={hasCard ? "Chọn policy" : "Không áp dụng (chưa bật CARD)"} /></SelectTrigger>
          <SelectContent>{POLICIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {unrouted.length > 0 && (
        <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive">
          Profile {profile} chưa có rule cho {unrouted.join(", ")} — gateway sẽ từ chối. Thêm rule ở Routing Profiles hoặc chọn profile khác.
        </p>
      )}
      {no3ds.length > 0 && (
        <p role="alert" className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive">
          3DS REQUIRED nhưng route CARD của {profile} chỉ tới {no3ds.join(", ")}, không acquirer nào có 3DS — gateway sẽ
          từ chối. Chọn profile có acquirer hỗ trợ 3DS, hoặc để 3DS OPTIONAL.
        </p>
      )}

      {linked && (
        <label htmlFor="t-activate" className="flex items-center gap-2 text-sm">
          <Checkbox id="t-activate" checked={activate} onCheckedChange={(on) => setActivate(on === true)} />
          Encore dùng terminal này ngay để thu tiền (thay cho {activeTerminalId})
        </label>
      )}

      <div>
        <Button type="submit" disabled={create.isPending || !valid}>+ Create Terminal</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Merchant phải có Acquirer Connection tới acquirer của từng rule. Không tick "dùng ngay" thì terminal mới chỉ được
        Encore dùng sau khi bấm "Chuyển sang dùng terminal này".
      </p>
    </form>
  );
}
