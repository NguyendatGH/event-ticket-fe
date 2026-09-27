import { useId, useState } from "react";
import { LayoutGroup, TabIndicator } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PRICE_PRESETS, formatMoneyInput, parseMoneyInput } from "../lib";

/** Một nhóm lọc có tiêu đề (Danh mục / Thành phố / Khoảng giá). */
function FilterGroup({ title, children }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <h3 id={id} className="mb-3 text-sm font-medium text-foreground">
        {title}
      </h3>
      {/* Mỗi nhóm một LayoutGroup: vạch chọn trượt trong nhóm, không nhảy sang nhóm khác / bản trong Sheet. */}
      <LayoutGroup id={id}>{children}</LayoutGroup>
    </section>
  );
}

/** Một lựa chọn trong nhóm; đang chọn thì chữ xanh + vạch dọc bên trái (trượt giữa các lựa chọn). */
function Option({ active, onClick, children }) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          "focus-ring relative flex w-full cursor-pointer items-center py-1.5 pl-3 text-left text-sm transition-colors",
          active ? "text-primary" : "text-secondary-foreground hover:text-foreground"
        )}
      >
        {children}
        {active ? <TabIndicator id="filter-bar" className="inset-x-auto top-2 bottom-2 left-0 h-auto w-0.5" /> : null}
      </button>
    </li>
  );
}

/**
 * Bộ lọc marketplace (cột trái desktop, Sheet trên mobile).
 * values: { category, city, priceMin, priceMax } (chuỗi từ URL); onChange(patch).
 */
export function ListingFilters({ values, cities = [], onChange }) {
  const { category = "", city = "", priceMin = "", priceMax = "" } = values;
  const presetActive = PRICE_PRESETS.find((p) => p.priceMin === priceMin && p.priceMax === priceMax);
  const customActive = !presetActive && Boolean(priceMin || priceMax);

  return (
    <div>
      <FilterGroup title="Danh mục">
        <ul>
          <Option active={!category} onClick={() => onChange({ category: "" })}>
            Tất cả
          </Option>
          {CATEGORIES.map((c) => (
            <Option key={c.slug} active={category === c.slug} onClick={() => onChange({ category: category === c.slug ? "" : c.slug })}>
              {c.label}
            </Option>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Thành phố">
        <ul>
          <Option active={!city} onClick={() => onChange({ city: "" })}>
            Tất cả
          </Option>
          {cities.map((name) => (
            <Option key={name} active={city === name} onClick={() => onChange({ city: city === name ? "" : name })}>
              {name}
            </Option>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Khoảng giá">
        <ul>
          <Option active={!priceMin && !priceMax} onClick={() => onChange({ priceMin: "", priceMax: "" })}>
            Mọi mức giá
          </Option>
          {PRICE_PRESETS.map((p) => (
            <Option
              key={p.key}
              active={presetActive?.key === p.key}
              onClick={() => onChange(presetActive?.key === p.key ? { priceMin: "", priceMax: "" } : { priceMin: p.priceMin, priceMax: p.priceMax })}
            >
              {p.label}
            </Option>
          ))}
        </ul>
        {/* key đổi khi khoảng giá trên URL đổi (bấm preset, xóa chip...) → form tự tạo lại, ô nhập về đúng giá trị mới. */}
        <CustomPriceRange
          key={`${priceMin}-${priceMax}`}
          initialMin={customActive ? priceMin : ""}
          initialMax={customActive ? priceMax : ""}
          onApply={(range) => onChange(range)}
        />
      </FilterGroup>
    </div>
  );
}

/** Ô nhập khoảng giá tự chọn. Gõ "1250000" hiện "1.250.000"; chỉ ghi lên URL khi bấm "Áp dụng". */
function CustomPriceRange({ initialMin, initialMax, onApply }) {
  const [min, setMin] = useState(formatMoneyInput(initialMin));
  const [max, setMax] = useState(formatMoneyInput(initialMax));
  const [error, setError] = useState("");
  const id = useId();

  const submit = (e) => {
    e.preventDefault();
    const lo = parseMoneyInput(min);
    const hi = parseMoneyInput(max);
    if (lo != null && hi != null && lo > hi) {
      setError("Giá từ phải nhỏ hơn giá đến");
      return;
    }
    setError("");
    onApply({ priceMin: lo != null ? String(lo) : "", priceMax: hi != null ? String(hi) : "" });
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label htmlFor={`${id}-min`} className="text-caption text-muted-foreground">
            Từ (đ)
          </label>
          <Input id={`${id}-min`} inputMode="numeric" placeholder="0" value={min} onChange={(e) => setMin(formatMoneyInput(parseMoneyInput(e.target.value)))} className="tabular-nums" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-max`} className="text-caption text-muted-foreground">
            Đến (đ)
          </label>
          <Input id={`${id}-max`} inputMode="numeric" placeholder="Tối đa" value={max} onChange={(e) => setMax(formatMoneyInput(parseMoneyInput(e.target.value)))} className="tabular-nums" />
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" size="sm" className="w-full">
        Áp dụng khoảng giá
      </Button>
    </form>
  );
}
