import { memo } from "react";
import { useFormState } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const BuyerFields = memo(function BuyerFields({ form }) {
  const { errors } = useFormState({ control: form.control, name: "customer" });
  const e = errors.customer || {};
  return (
    <>
      <CheckoutField
        id="co-name"
        label="Họ và tên"
        error={e.name?.message}
        className="sm:col-span-2"
        inputProps={{ autoComplete: "name", ...form.register("customer.name") }}
      />
      <CheckoutField
        id="co-email"
        label="Email"
        type="email"
        hint="Xác nhận đơn và vé được gửi tới email này."
        error={e.email?.message}
        inputProps={{ autoComplete: "email", inputMode: "email", ...form.register("customer.email") }}
      />
      <CheckoutField
        id="co-phone"
        label="Số điện thoại"
        optional
        type="tel"
        error={e.phone?.message}
        inputProps={{ autoComplete: "tel", inputMode: "tel", ...form.register("customer.phone") }}
      />
    </>
  );
});

function CheckoutField({ id, label, type = "text", optional, hint, error, className, inputProps }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={id} className="text-secondary-foreground">
        {label}
        {optional ? <span className="font-normal text-muted-foreground">(không bắt buộc)</span> : null}
      </Label>
      <Input id={id} type={type} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...inputProps} />
      {error ? (
        <p id={`${id}-error`} className="text-meta text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-meta text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
