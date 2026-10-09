import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CUSTOM = "__custom__";

export function IdPicker({ id, label, value, options, onChange }) {
  const known = options.some((o) => o.value === value);
  const custom = !known;
  return (
    <div>
      <label className="mb-1 block text-xs font-medium" htmlFor={id}>{label}</label>
      <Select value={custom ? CUSTOM : value} onValueChange={(v) => onChange(v === CUSTOM ? "" : v)}>
        <SelectTrigger id={id}><SelectValue placeholder="Chọn" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          <SelectItem value={CUSTOM}>Nhập tay…</SelectItem>
        </SelectContent>
      </Select>
      {custom && (
        <Input className="mt-2" aria-label={`${label} (nhập tay)`} value={value}
          onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
