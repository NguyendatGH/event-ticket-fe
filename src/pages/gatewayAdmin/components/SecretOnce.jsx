import { Button } from "@/components/ui/button";

export function SecretOnce({ secret, onDismiss }) {
  if (!secret) return null;
  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
      <p className="text-sm font-semibold text-amber-200">This secret is shown only once.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Lưu lại ngay. Không có API nào đọc lại được giá trị này; mất thì phải rotate.
      </p>
      <code className="mt-3 block overflow-x-auto rounded bg-background px-3 py-2 font-mono text-sm">{secret}</code>
      <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onDismiss}>
        Tôi đã lưu
      </Button>
    </div>
  );
}
