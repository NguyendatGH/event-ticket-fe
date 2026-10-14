import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MiniField } from "./MiniField";

export function PriceRange({ filters, facets, onChange }) {
  const [min, setMin] = useState(filters.priceMin ?? "");
  const [max, setMax] = useState(filters.priceMax ?? "");
  const invalid = min !== "" && max !== "" && Number(min) > Number(max);
  const apply = (e) => {
    e.preventDefault();
    if (invalid) return;
    onChange({
      priceMin: min === "" ? null : Number(min),
      priceMax: max === "" ? null : Number(max),
    });
  };
  const money = {
    inputMode: "numeric",
    type: "number",
    min: 0,
    step: 50000,
    "aria-invalid": invalid || undefined,
    className: "tabular-nums",
  };
  return (
    <form onSubmit={apply} className="mt-4 space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <MiniField
          label="Từ (đ)"
          {...money}
          value={min}
          placeholder={String(facets?.price?.min ?? 0)}
          onChange={(e) => setMin(e.target.value)}
        />
        <MiniField
          label="Đến (đ)"
          {...money}
          value={max}
          placeholder={String(facets?.price?.max ?? "")}
          onChange={(e) => setMax(e.target.value)}
        />
      </div>
      {invalid ? (
        <p className="text-caption text-destructive">
          Giá "từ" phải nhỏ hơn giá "đến".
        </p>
      ) : null}
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        className="w-full"
        disabled={invalid}
      >
        Áp dụng khoảng giá
      </Button>
    </form>
  );
}
