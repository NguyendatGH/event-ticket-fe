/**
 * Khối "Thông tin người nhận" của trang thanh toán:
 *   GuestNote      dòng mời đăng nhập (giữ nguyên giỏ vé khi quay lại)
 *   BuyerFields    3 ô tên / email / số điện thoại
 */
import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFormState } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Link đăng nhập giữ nguyên giỏ vé (đọc URL tại đây để form không render lại khi đổi số lượng). */
export function GuestNote() {
  const { pathname, search } = useLocation();
  return (
    <p className="mb-6 text-sm text-muted-foreground">
      Bạn đang mua với tư cách khách.{" "}
      <Link to="/auth/login" state={{ from: `${pathname}${search}` }} className="link-accent">
        Đăng nhập để lưu vé vào tài khoản
      </Link>
    </p>
  );
}

/**
 * Ô người nhận. Vì sao memo + useFormState riêng: mỗi lần đổi số lượng vé, CheckoutForm render lại
 * (giỏ vé nằm trên URL). memo cắt phần này ra: nó chỉ render lại khi lỗi của chính "customer" đổi.
 */
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

/**
 * Một ô nhập của checkout. Khác `Field` dùng chung (@/components/form): dùng `form.register` (input
 * không điều khiển, gõ phím không render lại React) và giao diện gọn riêng cho trang thanh toán.
 */
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
