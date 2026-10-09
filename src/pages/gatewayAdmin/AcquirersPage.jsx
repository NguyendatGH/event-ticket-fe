// Một bảng cho TẤT CẢ acquirer: hàng = acquirer, cột = phương thức nhận, 3DS, BIN, và "đang dùng ở" profile nào.
// Trước đây mỗi acquirer là một thẻ riêng nên không so sánh được "ai nhận Google Pay?" hay "acquirer này có đang được route không?".
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateGatewayAcquirer, useGatewayAcquirers, useGatewayRoutingProfileDetails, useGatewayRoutingProfiles,
  useUpdateGatewayAcquirer,
} from "@/api";
import { Container, PageHeader } from "@/components/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AsyncSection } from "./components/AdminStates";
import { acquirerUsage, METHOD_LABEL, PAYMENT_METHODS } from "./lib";

const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
// Tên + 5 phương thức + 3DS + BIN + đang dùng ở + nút lưu.
const GRID = "grid grid-cols-[minmax(12rem,1.3fr)_repeat(5,4.5rem)_4rem_7.5rem_minmax(11rem,1.2fr)_5.5rem] items-center gap-x-3";

export default function AcquirersPage() {
  const query = useGatewayAcquirers();
  const profiles = useGatewayRoutingProfiles();
  const profileList = Array.isArray(profiles.data) ? profiles.data : [];
  const details = useGatewayRoutingProfileDetails(profileList.map((p) => p.code));
  const usage = acquirerUsage(details.map((q) => q.data).filter(Boolean));
  const [adding, setAdding] = useState(false);

  return (
    <Container className="py-10">
      <PageHeader eyebrow="BANKSIM GATEWAY ADMIN" title="Acquirers"
        description="Ngân hàng / đơn vị xử lý mà gateway route giao dịch tới, và những phương thức mỗi nơi nhận." />

      <dl className="mt-4 grid gap-3 rounded-lg border border-border px-4 py-3 text-sm sm:grid-cols-3">
        <div><dt className="font-medium">Phương thức nhận</dt>
          <dd className="text-muted-foreground">Acquirer chỉ được route cho method đã tick. Tick thiếu là terminal bị 409.</dd></div>
        <div><dt className="font-medium">3DS</dt>
          <dd className="text-muted-foreground">Có trang xác thực chủ thẻ (OTP). Chỉ áp dụng khi nhận Thẻ.</dd></div>
        <div><dt className="font-medium">BIN</dt>
          <dd className="text-muted-foreground">Có BIN thì ban tổ chức tự chọn được ngân hàng này (Encore tự nối merchant). Trống thì chỉ dùng qua Routing Profile.</dd></div>
      </dl>

      <div className="mt-6">
        {adding
          ? <CreateAcquirerForm onDone={() => setAdding(false)} />
          : <Button variant="secondary" onClick={() => setAdding(true)}>+ Thêm acquirer</Button>}
      </div>

      <div className="mt-6 overflow-x-auto">
        <AsyncSection query={query} empty="Chưa có acquirer nào." rows={3}>
          {(list) => (
            <div className="min-w-[62rem] rounded-lg border border-border">
              <div className={`${GRID} border-b border-border px-4 py-2 text-xs font-semibold uppercase text-muted-foreground`}>
                <span>Acquirer</span>
                {PAYMENT_METHODS.map((m) => <span key={m} className="text-center">{METHOD_LABEL[m]}</span>)}
                <span className="text-center">3DS</span>
                <span>BIN</span>
                <span>Đang dùng ở</span>
                <span />
              </div>
              {list.map((a) => <AcquirerRow key={a.code} acquirer={a} usedIn={usage[a.code]} usageLoaded={!details.some((q) => q.isPending)} />)}
            </div>
          )}
        </AsyncSection>
      </div>
    </Container>
  );
}

function AcquirerRow({ acquirer, usedIn, usageLoaded }) {
  const base = { methods: acquirer.paymentMethods ?? [], threeDs: Boolean(acquirer.threeDsSupported), bankBin: acquirer.bankBin ?? "" };
  const [draft, setDraft] = useState(null);
  const form = draft ?? base;
  const active = acquirer.status === "ACTIVE";
  const hasCard = form.methods.includes("CARD");
  const binInvalid = form.bankBin && form.bankBin.length !== 6;
  const dirty = !same(form.methods, base.methods) || form.threeDs !== base.threeDs || form.bankBin !== base.bankBin;
  const update = useUpdateGatewayAcquirer({
    onSuccess: () => { toast.success(`Đã cập nhật ${acquirer.code}`); setDraft(null); },
    onError: (e) => toast.error(e?.message ?? "Cập nhật thất bại"),
  });
  const toggle = (method, on) =>
    setDraft({ ...form, methods: on ? [...new Set([...form.methods, method])] : form.methods.filter((m) => m !== method) });

  return (
    <div className={`${GRID} border-b border-border px-4 py-3 text-sm last:border-b-0 ${active ? "" : "opacity-60"}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono">{acquirer.code}</span>
          <Badge variant={active ? "default" : "secondary"}>{acquirer.status}</Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground" title={acquirer.name}>{acquirer.name}</p>
        <button type="button" className="text-xs underline" disabled={update.isPending}
          onClick={() => update.mutate({ code: acquirer.code, status: active ? "INACTIVE" : "ACTIVE" })}>
          {active ? "Tắt" : "Bật"} acquirer
        </button>
      </div>

      {PAYMENT_METHODS.map((m) => (
        <span key={m} className="flex justify-center">
          <Checkbox aria-label={`${acquirer.code} nhận ${METHOD_LABEL[m]}`} checked={form.methods.includes(m)}
            onCheckedChange={(on) => toggle(m, on === true)} />
        </span>
      ))}
      <span className="flex justify-center">
        <Checkbox aria-label={`${acquirer.code} có 3DS`} checked={hasCard && form.threeDs} disabled={!hasCard}
          onCheckedChange={(on) => setDraft({ ...form, threeDs: on === true })} />
      </span>
      <Input aria-label={`BIN của ${acquirer.code}`} value={form.bankBin} placeholder="trống" inputMode="numeric"
        aria-invalid={binInvalid ? true : undefined}
        onChange={(e) => setDraft({ ...form, bankBin: e.target.value.replace(/\D/g, "").slice(0, 6) })} />

      <div className="text-xs">
        {!usageLoaded ? <span className="text-muted-foreground">…</span>
          : usedIn?.length ? usedIn.map((u) => (
            <p key={u.profile}><span className="font-mono">{u.profile}</span>
              <span className="text-muted-foreground"> · {u.methods.map((m) => METHOD_LABEL[m]).join(", ")}</span></p>
          ))
          : <span className="text-muted-foreground">
            {acquirer.bankBin ? "chỉ BTC chọn trực tiếp" : "chưa profile nào"}
          </span>}
      </div>

      <div className="flex flex-col gap-1">
        {dirty && (
          <>
            <Button size="sm" disabled={update.isPending || !form.methods.length || Boolean(binInvalid)}
              onClick={() => update.mutate({ code: acquirer.code, paymentMethods: form.methods,
                threeDsSupported: hasCard && form.threeDs, bankBin: form.bankBin })}>
              Lưu
            </Button>
            <button type="button" className="text-xs underline" onClick={() => setDraft(null)}>Hoàn tác</button>
          </>
        )}
      </div>
      {binInvalid && <p className="col-span-full text-xs text-destructive">BIN phải đủ 6 chữ số (hoặc để trống).</p>}
      {dirty && !form.methods.length && <p className="col-span-full text-xs text-destructive">Chọn ít nhất một phương thức.</p>}
    </div>
  );
}

function CreateAcquirerForm({ onDone }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [methods, setMethods] = useState(["CARD"]);
  const [threeDs, setThreeDs] = useState(false);
  const [bankBin, setBankBin] = useState("");
  const create = useCreateGatewayAcquirer({
    onSuccess: (a) => { toast.success(`Đã tạo acquirer ${a?.code ?? ""}`); onDone(); },
    onError: (e) => toast.error(e?.message ?? "Tạo acquirer thất bại"),
  });
  const hasCard = methods.includes("CARD");
  const valid = code.trim() && name.trim() && methods.length > 0 && (!bankBin || bankBin.length === 6);
  return (
    <form
      aria-label="Thêm acquirer"
      className="grid gap-4 rounded-lg border border-dashed border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        create.mutate({ code: code.trim(), name: name.trim(), paymentMethods: methods,
          threeDsSupported: hasCard && threeDs, bankBin: bankBin || null });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="acq-code">Mã acquirer</label>
          <Input id="acq-code" value={code} placeholder="bank-c" required
            onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9_-]/g, ""))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="acq-name">Tên</label>
          <Input id="acq-name" value={name} placeholder="Mock Bank C" required onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium" htmlFor="acq-bin">BIN ngân hàng (để BTC chọn được)</label>
          <Input id="acq-bin" value={bankBin} placeholder="970436" inputMode="numeric"
            onChange={(e) => setBankBin(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 text-xs font-medium">Phương thức nhận</legend>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <label key={m} htmlFor={`new-${m}`} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <Checkbox id={`new-${m}`} checked={methods.includes(m)}
                onCheckedChange={(on) => setMethods(on ? [...methods, m] : methods.filter((x) => x !== m))} />
              {METHOD_LABEL[m]}
            </label>
          ))}
        </div>
        {!methods.length && <p className="mt-2 text-sm text-destructive">Chọn ít nhất một phương thức.</p>}
      </fieldset>
      <label htmlFor="new-3ds" className="flex items-center gap-2 text-sm">
        <Checkbox id="new-3ds" checked={hasCard && threeDs} disabled={!hasCard} onCheckedChange={(on) => setThreeDs(on === true)} />
        Có 3DS (trang OTP){hasCard ? "" : " — chỉ áp dụng khi nhận Thẻ"}
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={create.isPending || !valid}>Tạo acquirer</Button>
        <button type="button" className="text-sm underline" onClick={onDone}>Huỷ</button>
      </div>
    </form>
  );
}
