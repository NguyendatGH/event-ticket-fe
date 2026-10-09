import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAddGatewayAcquirerConfig } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function MethodRoutes({ merNo, paths, onToggle }) {
  const [connecting, setConnecting] = useState(null);
  const add = useAddGatewayAcquirerConfig({
    onSuccess: () => { setConnecting(null); toast.success("Đã nối merchant với acquirer"); },
    onError: (e) => toast.error(e?.message ?? "Nối acquirer thất bại"),
  });
  const startConnect = (code) => setConnecting({ code, mid: `MID-${merNo}-${code}`, tid: `TID-${merNo}-${code}` });

  return (
    <div className="rounded-lg border border-border">
      <div className="hidden grid-cols-[9rem_1fr_9rem] gap-3 border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground sm:grid">
        <span>Phương thức</span>
        <span>Đi qua acquirer (theo thứ tự)</span>
        <span>Khách thấy?</span>
      </div>
      {paths.map((p) => (
        <div key={p.method} className="grid items-start gap-2 border-b border-border px-3 py-3 last:border-b-0 sm:grid-cols-[9rem_1fr_9rem] sm:gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={p.enabled} onCheckedChange={(on) => onToggle(p.method, Boolean(on))} />
            {p.method}
          </label>

          <div className="space-y-2 text-sm">
            {p.noRoute ? (
              <p className="text-muted-foreground">
                Profile chưa có rule cho {p.method}.{" "}
                <Link className="underline" to="/gateway-admin/routing-profiles">Thêm rule ›</Link>
              </p>
            ) : (
              p.chain.map((c, i) => (
                <div key={c.code} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs text-muted-foreground">{i + 1}.</span>
                  <span className="font-mono">{c.code}</span>
                  <AcquirerState method={p.method} step={c} onConnect={() => startConnect(c.code)} />
                </div>
              ))
            )}
            {connecting && p.chain.some((c) => c.code === connecting.code) && (
              <form
                className="grid gap-2 rounded-md border border-dashed border-border p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  add.mutate({ merNo, acquirerCode: connecting.code, mid: connecting.mid, tid: connecting.tid });
                }}
              >
                <Input aria-label={`MID của ${connecting.code}`} value={connecting.mid}
                  onChange={(e) => setConnecting({ ...connecting, mid: e.target.value })} />
                <Input aria-label={`TID của ${connecting.code}`} value={connecting.tid}
                  onChange={(e) => setConnecting({ ...connecting, tid: e.target.value })} />
                <Button type="submit" size="sm" disabled={add.isPending}>Nối</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setConnecting(null)}>Hủy</Button>
              </form>
            )}
          </div>

          <div><Visibility path={p} /></div>
        </div>
      ))}
    </div>
  );
}

function AcquirerState({ method, step, onConnect }) {
  if (step.exists === false) return <span className="text-xs text-destructive">acquirer không tồn tại</span>;
  if (step.accepts === false)
    return (
      <span className="text-xs text-destructive">
        không nhận {method} — <Link className="underline" to="/gateway-admin/acquirers">sửa ở trang Acquirers</Link>
      </span>
    );
  if (step.threeDsOk === false)
    return <span className="text-xs text-destructive">không có 3DS (terminal đang bắt buộc 3DS)</span>;
  if (step.connected === false)
    return (
      <>
        <span className="text-xs text-destructive">merchant chưa nối</span>
        <Button type="button" size="sm" variant="secondary" aria-label={`Nối ngay ${step.code}`} onClick={onConnect}>Nối ngay</Button>
      </>
    );
  if (step.usable) return <span className="text-xs text-muted-foreground">✓ nhận {method} · đã nối</span>;
  return <span className="text-xs text-muted-foreground">…</span>;
}

function Visibility({ path }) {
  if (!path.enabled) return <span className="text-xs text-muted-foreground">{path.noRoute ? "—" : "Chưa bật"}</span>;
  if (path.noRoute) return <Badge variant="destructive">Chưa có rule</Badge>;
  if (path.visible === null) return <span className="text-xs text-muted-foreground">…</span>;
  return path.visible ? <Badge>Khách thấy</Badge> : <Badge variant="destructive">Khách không thấy</Badge>;
}
