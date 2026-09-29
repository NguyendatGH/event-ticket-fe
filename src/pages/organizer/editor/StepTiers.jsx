// Bước 3 trình sửa sự kiện: hạng vé; đã bán/giữ thì khóa giá và không cho xóa.

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCompactVND, formatNumber, formatVND } from "@/lib/format";
import { AnimatedItem, AnimatedList } from "@/components/motion";
import { OrgField } from "../components/OrgUi";
import { emptyTier, readInt } from "./schema";

export function StepTiers({ disabled, published }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const tiers = useFieldArray({ control, name: "tiers", keyName: "key" });
  const values = useWatch({ name: "tiers" }) || [];
  const totalQty = values.reduce((s, t) => s + (readInt(t.totalQuantity) ?? 0), 0);
  const maxRevenue = values.reduce((s, t) => s + (readInt(t.totalQuantity) ?? 0) * (readInt(t.price) ?? 0), 0);
  const rootError = errors.tiers?.root?.message || errors.tiers?.message;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-ui font-semibold text-foreground">Hạng vé</h3>
          <p className="max-w-[60ch] text-meta leading-relaxed text-muted-foreground">
            {published
              ? "Sự kiện đã xuất bản: có thể thêm hạng mới và đổi số lượng. Hạng đã có vé bán hoặc đang giữ thì khóa giá và không xóa được."
              : "Mỗi hạng là một dòng trên trang sự kiện. Giá 0 là vé miễn phí."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {values.length} hạng, {formatNumber(totalQty)} vé
          {maxRevenue > 0 ? <span className="text-disabled-foreground">, tối đa {formatCompactVND(maxRevenue)}</span> : null}
        </p>
      </div>

      {rootError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {rootError}
        </p>
      ) : null}

      <AnimatedList as="ol" className="mt-6 border-t border-border">
        {tiers.fields.map((row, i) => {
          const t = values[i] || row;
          const locked = (t.sold ?? 0) + (t.reserved ?? 0);
          const priceLocked = Boolean(t.id) && locked > 0;
          const e = errors.tiers?.[i] || {};
          const hint = tierPriceHint(readInt(t.price), priceLocked);
          return (
            <AnimatedItem key={row.key} className="border-b border-border py-6" aria-label={`Hạng vé ${i + 1}`}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="eyebrow tabular-nums">
                  Hạng {String(i + 1).padStart(2, "0")}
                  {t.id && locked > 0 ? (
                    <span className="ml-3 tracking-normal text-secondary-foreground normal-case">
                      Đã bán {formatNumber(t.sold ?? 0)}, đang giữ {formatNumber(t.reserved ?? 0)}
                    </span>
                  ) : null}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => tiers.remove(i)}
                  disabled={disabled || priceLocked}
                  title={priceLocked ? "Hạng đã có vé bán hoặc đang giữ, không xóa được" : undefined}
                  aria-label={`Xóa hạng vé ${i + 1}`}
                >
                  {priceLocked ? <Lock aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                  Xóa
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)]">
                <OrgField label="Tên hạng vé" htmlFor={`tier-${i}-name`} error={e.name?.message}>
                  {(a) => <Input id={`tier-${i}-name`} placeholder="VIP" disabled={disabled} {...a} {...register(`tiers.${i}.name`)} />}
                </OrgField>
                <OrgField
                  label="Giá (VND)"
                  htmlFor={`tier-${i}-price`}
                  error={e.price?.message}
                  hint={hint}
                >
                  {(a) => (
                    <Input
                      id={`tier-${i}-price`}
                      inputMode="numeric"
                      placeholder="1500000"
                      className="tabular-nums read-only:cursor-not-allowed read-only:text-muted-foreground read-only:hover:border-input"
                      readOnly={priceLocked}
                      disabled={disabled}
                      {...a}
                      {...register(`tiers.${i}.price`)}
                    />
                  )}
                </OrgField>
                <OrgField
                  label="Số lượng"
                  htmlFor={`tier-${i}-qty`}
                  error={e.totalQuantity?.message}
                  hint={locked > 0 ? `Tối thiểu ${formatNumber(locked)}` : null}
                >
                  {(a) => <Input id={`tier-${i}-qty`} inputMode="numeric" placeholder="500" className="tabular-nums" disabled={disabled} {...a} {...register(`tiers.${i}.totalQuantity`)} />}
                </OrgField>
                <OrgField label="Tối đa mỗi đơn" htmlFor={`tier-${i}-max`} error={e.maxPerOrder?.message}>
                  {(a) => <Input id={`tier-${i}-max`} inputMode="numeric" placeholder="4" className="tabular-nums" disabled={disabled} {...a} {...register(`tiers.${i}.maxPerOrder`)} />}
                </OrgField>
              </div>
              <OrgField label="Mô tả" htmlFor={`tier-${i}-desc`} optional className="mt-5" error={e.description?.message}>
                {(a) => <Input id={`tier-${i}-desc`} placeholder="Khu vực sát sân khấu, cửa vào riêng" disabled={disabled} {...a} {...register(`tiers.${i}.description`)} />}
              </OrgField>
            </AnimatedItem>
          );
        })}
      </AnimatedList>

      {tiers.fields.length === 0 ? <p className="border-b border-border py-6 text-sm text-muted-foreground">Chưa có hạng vé nào. Thêm ít nhất một hạng để xuất bản.</p> : null}

      <div className="mt-6">
        <Button type="button" variant="secondary" onClick={() => tiers.append(emptyTier())} disabled={disabled}>
          <Plus aria-hidden="true" />
          Thêm hạng vé
        </Button>
      </div>
    </div>
  );
}

function tierPriceHint(price, priceLocked) {
  if (priceLocked) return "Đã có vé bán, không đổi được giá.";
  if (price == null) return null;
  if (price === 0) return "Miễn phí";
  return formatVND(price);
}
