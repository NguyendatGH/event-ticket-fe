// Acquirer = ngân hàng/đơn vị gateway gửi giao dịch tới. Năng lực của nó là DỮ LIỆU admin khai ở đây:
// nhận phương thức nào, có trang xác thực 3DS (OTP) hay không. Thêm acquirer không cần sửa code gateway,
// và mock bank không cần biết gì — nó chỉ duyệt hoặc từ chối.
// Có BIN = ngân hàng BTC tự chọn được ở trang "Tài khoản nhận tiền" (tài khoản nhận tiền nằm ở chính ngân hàng đó).
// Không BIN = chỉ dùng để admin dựng routing profile.
import { useState } from "react";
import { toast } from "sonner";
import { useCreateGatewayAcquirer, useGatewayAcquirers, useUpdateGatewayAcquirer } from "@/api";
import { Container, PageHeader } from "@/components/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AsyncSection } from "./components/AdminStates";

const METHODS = ["CARD", "QR", "PAYNOW", "GOOGLE_PAY", "APPLE_PAY"];
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

export default function AcquirersPage() {
  const query = useGatewayAcquirers();
  return (
    <Container className="py-10">
      <PageHeader eyebrow="BANKSIM GATEWAY ADMIN" title="Acquirers"
        description="Ngân hàng/đơn vị xử lý mà gateway route giao dịch tới, và những phương thức mỗi nơi nhận." />
      <p className="mt-4 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
        Một acquirer nhận được nhiều phương thức (ví dụ vừa thẻ vừa QR). Tick <strong>3DS</strong> nếu nó có trang xác
        thực chủ thẻ (OTP); không tick thì thẻ được duyệt/từ chối ngay. Khai <strong>BIN</strong> thì ban tổ chức tự chọn
        được ngân hàng này cho terminal của họ (Encore tự tạo Acquirer Connection). Không có BIN thì chỉ dùng qua
        Routing Profiles + Acquirer Connection.
      </p>
      <CreateAcquirerForm />
      <div className="mt-6">
        <AsyncSection query={query} empty="Chưa có acquirer nào." rows={3}>
          {(list) => (
            <ul className="space-y-3">
              {list.map((a) => <AcquirerRow key={a.code} acquirer={a} />)}
            </ul>
          )}
        </AsyncSection>
      </div>
    </Container>
  );
}

function MethodPicker({ idPrefix, methods, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {METHODS.map((m) => (
        <label key={m} htmlFor={`${idPrefix}-${m}`} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <Checkbox id={`${idPrefix}-${m}`} checked={methods.includes(m)}
            onCheckedChange={(on) => onChange(on ? [...methods, m] : methods.filter((x) => x !== m))} />
          {m}
        </label>
      ))}
    </div>
  );
}

function ThreeDsToggle({ id, methods, value, onChange }) {
  // 3DS là chuyện của thẻ: không nhận CARD thì cờ này vô nghĩa.
  const hasCard = methods.includes("CARD");
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <Checkbox id={id} checked={hasCard && value} disabled={!hasCard} onCheckedChange={(on) => onChange(on === true)} />
      Có 3DS (trang OTP){hasCard ? "" : " — chỉ áp dụng khi nhận CARD"}
    </label>
  );
}

function CreateAcquirerForm() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [methods, setMethods] = useState(["CARD"]);
  const [threeDs, setThreeDs] = useState(false);
  const [bankBin, setBankBin] = useState("");
  const create = useCreateGatewayAcquirer({
    onSuccess: (a) => {
      toast.success(`Đã tạo acquirer ${a?.code ?? ""}`);
      setCode(""); setName(""); setMethods(["CARD"]); setThreeDs(false); setBankBin("");
    },
    onError: (e) => toast.error(e?.message ?? "Tạo acquirer thất bại"),
  });
  const valid = code.trim() && name.trim() && methods.length > 0 && (!bankBin || bankBin.length === 6);
  return (
    <form
      className="mt-6 grid gap-4 rounded-lg border border-dashed border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        create.mutate({ code: code.trim(), name: name.trim(), paymentMethods: methods,
          threeDsSupported: methods.includes("CARD") && threeDs, bankBin: bankBin || null });
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
      <div>
        <p className="mb-2 text-xs font-medium">Phương thức nhận</p>
        <MethodPicker idPrefix="new" methods={methods} onChange={setMethods} />
        {!methods.length && <p className="mt-2 text-sm text-destructive">Chọn ít nhất một phương thức.</p>}
      </div>
      <ThreeDsToggle id="new-3ds" methods={methods} value={threeDs} onChange={setThreeDs} />
      <div>
        <Button type="submit" disabled={create.isPending || !valid}>+ Tạo acquirer</Button>
      </div>
    </form>
  );
}

function AcquirerRow({ acquirer }) {
  const base = { methods: acquirer.paymentMethods ?? [], threeDs: Boolean(acquirer.threeDsSupported), bankBin: acquirer.bankBin ?? "" };
  const [draft, setDraft] = useState(null);
  const form = draft ?? base;
  const active = acquirer.status === "ACTIVE";
  const dirty = !same(form.methods, base.methods) || form.threeDs !== base.threeDs || form.bankBin !== base.bankBin;
  const update = useUpdateGatewayAcquirer({
    onSuccess: () => { toast.success(`Đã cập nhật ${acquirer.code}`); setDraft(null); },
    onError: (e) => toast.error(e?.message ?? "Cập nhật thất bại"),
  });

  return (
    <li className="grid gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono">{acquirer.code}</span>
        <span className="text-sm text-muted-foreground">{acquirer.name}</span>
        <Badge variant={active ? "default" : "secondary"}>{acquirer.status}</Badge>
        {acquirer.bankBin && <Badge variant="outline">BTC chọn được · BIN {acquirer.bankBin}</Badge>}
        <Button size="sm" variant="secondary" className="ml-auto" disabled={update.isPending}
          onClick={() => update.mutate({ code: acquirer.code, status: active ? "INACTIVE" : "ACTIVE" })}>
          {active ? "Tắt" : "Bật"}
        </Button>
      </div>
      <MethodPicker idPrefix={acquirer.code} methods={form.methods} onChange={(methods) => setDraft({ ...form, methods })} />
      <ThreeDsToggle id={`${acquirer.code}-3ds`} methods={form.methods} value={form.threeDs}
        onChange={(threeDs) => setDraft({ ...form, threeDs })} />
      <div className="max-w-xs">
        <label className="mb-1 block text-xs font-medium" htmlFor={`${acquirer.code}-bin`}>BIN ngân hàng</label>
        <Input id={`${acquirer.code}-bin`} value={form.bankBin} placeholder="Trống = BTC không chọn được" inputMode="numeric"
          onChange={(e) => setDraft({ ...form, bankBin: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
      </div>
      {dirty && (
        <div className="flex items-center gap-3">
          <Button size="sm" disabled={update.isPending || !form.methods.length || (form.bankBin && form.bankBin.length !== 6)}
            onClick={() => update.mutate({ code: acquirer.code, paymentMethods: form.methods,
              threeDsSupported: form.methods.includes("CARD") && form.threeDs, bankBin: form.bankBin })}>
            Lưu
          </Button>
          <button type="button" className="text-sm underline" onClick={() => setDraft(null)}>Hoàn tác</button>
        </div>
      )}
    </li>
  );
}
