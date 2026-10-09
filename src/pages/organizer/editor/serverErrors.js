import { applyApiErrors, toFormPath } from "@/lib/forms";

export function normalizeServerField(field) {
  const f = toFormPath(field || "");
  if (/^description(\.\d+)?$/.test(f)) return "description";
  if (f === "tiers") return "tiers.root";
  if (f === "venue") return "venue.name";
  if (/^schedule\.\d+$/.test(f)) return `${f}.title`;
  return f;
}

export function applyServerErrors(form, err) {
  const errors = (err?.errors || []).filter((e) => e?.field).map((e) => ({ ...e, field: normalizeServerField(e.field) }));
  applyApiErrors(form, { ...err, errors }, { root: false });
  return errors[0]?.field ?? null;
}
