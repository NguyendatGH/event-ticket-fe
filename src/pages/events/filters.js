import { categoryLabel, EVENT_SORTS, WHEN_OPTIONS } from "@/lib/constants";
import { formatDate, formatVND } from "@/lib/format";

export const FILTER_KEYS = [
  "q",
  "category",
  "city",
  "when",
  "from",
  "to",
  "priceMin",
  "priceMax",
];
export const DEFAULT_SORT = "date";

export const PRICE_PRESETS = [
  { id: "free", label: "Miễn phí", min: null, max: 0 },
  { id: "u500", label: "Dưới 500.000đ", min: null, max: 500000 },
  { id: "500-1m", label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
  { id: "1m-2m", label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
  { id: "o2m", label: "Trên 2.000.000đ", min: 2000000, max: null },
];

const intOrNull = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

export function readFilters(searchParams) {
  const get = (k) => searchParams.get(k)?.trim() || "";
  const sort = get("sort");
  return {
    q: get("q"),
    category: get("category"),
    city: get("city"),
    when: WHEN_OPTIONS.some((w) => w.value === get("when")) ? get("when") : "",
    from: /^\d{4}-\d{2}-\d{2}$/.test(get("from")) ? get("from") : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(get("to")) ? get("to") : "",
    priceMin: intOrNull(get("priceMin")),
    priceMax: intOrNull(get("priceMax")),
    sort: EVENT_SORTS.some((s) => s.value === sort) ? sort : DEFAULT_SORT,
  };
}

export function applyPatch(searchParams, patch) {
  const next = new URLSearchParams(searchParams);
  const p = { ...patch };
  if (p.when) Object.assign(p, { from: null, to: null });
  if (p.from || p.to) p.when = null;
  for (const [k, v] of Object.entries(p)) {
    if (v == null || v === "" || (k === "sort" && v === DEFAULT_SORT))
      next.delete(k);
    else next.set(k, String(v));
  }
  return next;
}

export function clearFilters(searchParams) {
  const next = new URLSearchParams(searchParams);
  FILTER_KEYS.forEach((k) => next.delete(k));
  return next;
}

export const activeCount = (f) =>
  [
    f.category,
    f.city,
    f.when || f.from || f.to,
    f.priceMin != null || f.priceMax != null,
  ].filter(Boolean).length;

const matchingPreset = (f) =>
  PRICE_PRESETS.find((p) => p.min === f.priceMin && p.max === f.priceMax);

export const presetOf = (f) => matchingPreset(f)?.id ?? null;

function priceLabel(f) {
  const preset = matchingPreset(f);
  if (preset) return preset.label;
  const { priceMin: min, priceMax: max } = f;
  if (min != null && max != null)
    return `${formatVND(min)} - ${formatVND(max)}`;
  if (min != null) return `Từ ${formatVND(min)}`;
  if (max != null) return `Đến ${formatVND(max)}`;
  return "";
}

export function activeChips(f) {
  const chips = [];
  if (f.q) chips.push({ key: "q", label: `"${f.q}"`, patch: { q: null } });
  if (f.category)
    chips.push({
      key: "category",
      label: categoryLabel(f.category),
      patch: { category: null },
    });
  if (f.city) chips.push({ key: "city", label: f.city, patch: { city: null } });
  if (f.when)
    chips.push({
      key: "when",
      label: WHEN_OPTIONS.find((w) => w.value === f.when)?.label,
      patch: { when: null },
    });
  if (f.from || f.to) {
    let label = `${formatDate(f.from)} - ${formatDate(f.to)}`;
    if (!f.to) label = `Từ ${formatDate(f.from)}`;
    if (!f.from) label = `Đến ${formatDate(f.to)}`;
    chips.push({ key: "range", label, patch: { from: null, to: null } });
  }
  if (f.priceMin != null || f.priceMax != null)
    chips.push({
      key: "price",
      label: priceLabel(f),
      patch: { priceMin: null, priceMax: null },
    });
  return chips;
}
