import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { AnimatedNumber } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/input";
import { useAppConfig } from "@/api";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatDiff, formatMoneyInput, parseMoneyInput, priceDiffPct, priceSchema } from "../lib";

function Row({ label, children, strong, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">
        {label}
        {hint ? <span className="block text-caption text-muted-foreground">{hint}</span> : null}
      </dt>
      <dd className={cn("text-right text-sm tabular-nums", strong ? "text-base font-semibold text-primary" : "text-foreground")}>{children}</dd>
    </div>
  );
}

/** Bảng tính trực tiếp: giá gốc, giá bán, chênh lệch, giá trần. */
function Breakdown({ original, price, min, max }) {
  const valid = price != null && price >= min && (max == null || price <= max);
  const diff = valid ? priceDiffPct(price, original) : null;
  return (
    <dl aria-live="polite">
      <Row label="Giá gốc">{formatVND(original)}</Row>
      <Row label="Giá bán" strong>
        {/* Số chạy theo giá đang gõ (0.4s), không chạy từ 0 mỗi lần. */}
        {valid ? <AnimatedNumber value={price} from={original} format={formatVND} duration={0.4} /> : <span className="font-normal text-muted-foreground">Chưa nhập</span>}
      </Row>
      <Row label="Chênh lệch">
        {diff == null ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <span className={diff > 0 ? "text-warning" : diff < 0 ? "text-primary" : undefined}>
            {formatDiff(diff)}
            {diff !== 0 ? <span className="ml-2 text-muted-foreground">({price - original > 0 ? "+" : "-"}{formatVND(Math.abs(price - original))})</span> : null}
          </span>
        )}
      </Row>
      {max != null ? <Row label="Giá trần" hint="Mức tối đa được phép bán">{formatVND(max)}</Row> : null}
    </dl>
  );
}

/** Lá duy nhất theo dõi giá đang gõ: mỗi phím chỉ render bảng tạm tính, không render lại cả form. */
function LiveBreakdown({ control, original, min, max }) {
  const price = useWatch({ control, name: "price" });
  return <Breakdown original={original} price={price} min={min} max={max} />;
}

/**
 * Form giá bán (đăng mới hoặc đổi giá). Ô nhập định dạng "1.250.000", giá trị form là số.
 * onSubmit(price, form) → trả Promise/mutation; lỗi BE đổ vào form qua applyApiErrors ở caller.
 */
export function PriceForm({ original, max, defaultPrice = null, submitLabel, pending, onSubmit, children, secondaryAction }) {
  const id = useId();
  const { resaleMinPrice: min } = useAppConfig(); // giá sàn BE cấu hình (GET /api/v1/config)
  const form = useForm({ resolver: zodResolver(priceSchema(max, min)), defaultValues: { price: defaultPrice }, mode: "onTouched" });
  const error = form.formState.errors.price?.message;
  const rootError = form.formState.errors.root?.server?.message;

  const presets = [
    { label: "Bằng giá gốc", value: original },
    max != null && max !== original ? { label: "Giá trần", value: max } : null,
  ].filter((p) => p && p.value >= min);

  const submit = form.handleSubmit((values) => onSubmit(values.price, form));

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_minmax(300px,380px)] lg:gap-14">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor={`${id}-price`} className="text-sm font-medium text-foreground">
            Giá bán
          </label>
          <Controller
            control={form.control}
            name="price"
            render={({ field }) => (
              <div className="relative">
                <input
                  id={`${id}-price`}
                  ref={field.ref}
                  name={field.name}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={formatMoneyInput(original)}
                  value={formatMoneyInput(field.value)}
                  onChange={(e) => field.onChange(parseMoneyInput(e.target.value))}
                  onBlur={field.onBlur}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${id}-price-help`}
                  className={cn(fieldClass, "h-14 w-full pr-12 pl-4 text-2xl font-semibold tabular-nums placeholder:font-normal")}
                />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg text-muted-foreground">đ</span>
              </div>
            )}
          />
          <p id={`${id}-price-help`} className={cn("text-caption", error ? "text-destructive" : "text-muted-foreground")}>
            {error || `Từ ${formatVND(min)} đến ${formatVND(max)}.`}
          </p>
          {presets.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {presets.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => form.setValue("price", p.value, { shouldValidate: true, shouldDirty: true })}
                >
                  {p.label}
                  <span className="text-muted-foreground tabular-nums">{formatVND(p.value)}</span>
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {children}

        {rootError ? (
          <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">
            {rootError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {submitLabel}
          </Button>
          {secondaryAction}
        </div>
      </div>

      <div className="h-fit border border-border bg-background-2 p-6">
        <p className="eyebrow mb-2">Tạm tính</p>
        <LiveBreakdown control={form.control} original={original} min={min} max={max} />
        <p className="mt-5 border-t border-border pt-5 text-caption leading-relaxed text-muted-foreground">
          Phiên bản hiện tại chưa có rút tiền tự động: tiền bán vé được đối soát và chuyển cho bạn thủ công sau khi giao dịch hoàn tất.
        </p>
      </div>
    </form>
  );
}

