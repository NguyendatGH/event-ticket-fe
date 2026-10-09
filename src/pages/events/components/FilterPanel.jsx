import { useId, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, CITIES, WHEN_OPTIONS } from "@/lib/constants";
import { formatVND } from "@/lib/format";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PRICE_PRESETS, presetOf } from "../filters";
import { MiniField } from "./MiniField";
import { PriceRange } from "./PriceRange";

function OptionRow({ active, label, count, onClick, disabled }) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "group relative flex w-full cursor-pointer items-baseline gap-2 py-2 pl-3.5 text-left text-sm transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-40",
          active
            ? "font-medium text-foreground"
            : "text-secondary-foreground hover:text-foreground",
        )}
      >
        {active ? (
          <motion.span
            layoutId="filter-active"
            transition={SPRING.indicator}
            className="absolute top-1/2 left-0 -mt-2 h-4 w-0.5 bg-primary"
            aria-hidden="true"
          />
        ) : null}
        <span>{label}</span>
        {count != null ? (
          <span className="text-caption font-normal text-muted-foreground tabular-nums">
            {count}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function Group({ title, children, className }) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn("border-t border-border py-6", className)}
    >
      <h3 id={id} className="eyebrow mb-3 text-secondary-foreground">
        {title}
      </h3>
      <LayoutGroup id={id}>{children}</LayoutGroup>
    </section>
  );
}

function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 py-1 pl-3.5" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${55 + ((i * 17) % 35)}%` }}
        />
      ))}
    </div>
  );
}

export function FilterPanel({
  filters,
  facets,
  facetsLoading,
  onChange,
  onReset,
  hasActive,
  className,
}) {
  const catCounts = Object.fromEntries(
    (facets?.categories ?? []).map((c) => [c.slug, c.count]),
  );
  const cities = facets?.cities?.length
    ? facets.cities
    : CITIES.map((name) => ({ name, count: null }));
  const preset = presetOf(filters);
  const [customDates, setCustomDates] = useState(
    Boolean(filters.from || filters.to),
  );
  const showDates = customDates || Boolean(filters.from || filters.to);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between pb-5">
        <h2 className="heading-caps">Bộ lọc</h2>
        {hasActive ? (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer text-sm link-accent"
          >
            Xóa bộ lọc
          </button>
        ) : null}
      </div>

      <Group title="Danh mục">
        {facetsLoading ? (
          <ListSkeleton rows={6} />
        ) : (
          <ul>
            <OptionRow
              label="Tất cả"
              active={!filters.category}
              onClick={() => onChange({ category: null })}
            />
            {CATEGORIES.map((c) => (
              <OptionRow
                key={c.slug}
                label={c.label}
                count={facets ? (catCounts[c.slug] ?? 0) : null}
                active={filters.category === c.slug}
                onClick={() =>
                  onChange({
                    category: filters.category === c.slug ? null : c.slug,
                  })
                }
              />
            ))}
          </ul>
        )}
      </Group>

      <Group title="Thành phố">
        {facetsLoading ? (
          <ListSkeleton rows={3} />
        ) : (
          <ul>
            <OptionRow
              label="Mọi nơi"
              active={!filters.city}
              onClick={() => onChange({ city: null })}
            />
            {cities.map((c) => (
              <OptionRow
                key={c.name}
                label={c.name}
                count={c.count}
                active={filters.city === c.name}
                onClick={() =>
                  onChange({ city: filters.city === c.name ? null : c.name })
                }
              />
            ))}
          </ul>
        )}
      </Group>

      <Group title="Thời gian">
        <ul>
          <OptionRow
            label="Mọi lúc"
            active={!filters.when && !showDates}
            onClick={() => {
              setCustomDates(false);
              onChange({ when: null, from: null, to: null });
            }}
          />
          {WHEN_OPTIONS.map((w) => (
            <OptionRow
              key={w.value}
              label={w.label}
              active={filters.when === w.value}
              onClick={() => {
                setCustomDates(false);
                onChange({ when: filters.when === w.value ? null : w.value });
              }}
            />
          ))}
          <OptionRow
            label="Chọn ngày"
            active={showDates && !filters.when}
            onClick={() => {
              setCustomDates(true);
              if (filters.when) onChange({ when: null });
            }}
          />
        </ul>
        {showDates && !filters.when ? (
          <div className="mt-3 grid grid-cols-2 gap-3 pl-3.5">
            <MiniField
              label="Từ ngày"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => onChange({ from: e.target.value || null })}
              className="px-2 text-meta"
            />
            <MiniField
              label="Đến ngày"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => onChange({ to: e.target.value || null })}
              className="px-2 text-meta"
            />
          </div>
        ) : null}
      </Group>

      <Group title="Khoảng giá" className="border-b">
        <ul>
          <OptionRow
            label="Mọi mức giá"
            active={filters.priceMin == null && filters.priceMax == null}
            onClick={() => onChange({ priceMin: null, priceMax: null })}
          />
          {PRICE_PRESETS.map((p) => (
            <OptionRow
              key={p.id}
              label={p.label}
              active={preset === p.id}
              onClick={() =>
                onChange(
                  preset === p.id
                    ? { priceMin: null, priceMax: null }
                    : { priceMin: p.min, priceMax: p.max },
                )
              }
            />
          ))}
        </ul>
        <PriceRange
          key={`${filters.priceMin}-${filters.priceMax}`}
          filters={filters}
          facets={facets}
          onChange={onChange}
        />
        {facets?.price?.max != null ? (
          <p className="mt-3 text-caption text-disabled-foreground">
            Giá vé hiện có: {formatVND(facets.price.min ?? 0)} -{" "}
            {formatVND(facets.price.max)}
          </p>
        ) : null}
      </Group>
    </div>
  );
}
