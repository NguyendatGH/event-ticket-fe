import { useState } from "react";
import { toast } from "sonner";
import { useAddGatewayAcquirerConfig, useGatewayAcquirers } from "@/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdPicker } from "./IdPicker";

export function AddAcquirerForm({ merNo, terminals }) {
  const acquirers = useGatewayAcquirers();
  const list = Array.isArray(acquirers.data) ? acquirers.data : [];
  const terminalList = Array.isArray(terminals) ? terminals : [];
  const [code, setCode] = useState("");
  const [mid, setMid] = useState(null);
  const [tid, setTid] = useState(null);

  const midValue = mid ?? merNo;
  const tidValue = tid ?? terminalList[0]?.terminalId ?? "";
  const midOptions = [
    { value: merNo, label: `${merNo} · Gateway Merchant No` },
    ...(code ? [{ value: `MID-${merNo}-${code}`, label: `MID-${merNo}-${code} · tự sinh` }] : []),
  ];
  const tidOptions = [
    ...terminalList.map((t) => ({ value: t.terminalId, label: `${t.terminalId} · ${t.name}` })),
    ...(code ? [{ value: `TID-${merNo}-${code}`, label: `TID-${merNo}-${code} · tự sinh` }] : []),
  ];

  const add = useAddGatewayAcquirerConfig({
    onSuccess: () => { setCode(""); setMid(null); setTid(null); toast.success("Đã thêm acquirer connection"); },
    onError: (e) => toast.error(e?.message ?? "Thêm thất bại"),
  });
  const ready = code && midValue.trim() && tidValue.trim();

  return (
    <form
      className="mt-6 grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(e) => { e.preventDefault(); if (ready) add.mutate({ merNo, acquirerCode: code, mid: midValue.trim(), tid: tidValue.trim() }); }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium" htmlFor="a-code">Acquirer</label>
        <Select value={code} onValueChange={setCode}>
          <SelectTrigger id="a-code"><SelectValue placeholder="Chọn acquirer" /></SelectTrigger>
          <SelectContent>
            {list.map((a) => (
              <SelectItem key={a.code} value={a.code}>
                {a.code} — {a.name} ({a.paymentMethods?.join(", ") || "chưa nhận method nào"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <IdPicker id="a-mid" label="Acquirer Merchant ID (MID)" value={midValue} options={midOptions} onChange={setMid} />
      <IdPicker id="a-tid" label="Acquirer Terminal ID (TID)" value={tidValue} options={tidOptions} onChange={setTid} />
      <div className="flex items-end">
        <Button type="submit" disabled={add.isPending || !ready}>Add Acquirer Connection</Button>
      </div>
    </form>
  );
}
