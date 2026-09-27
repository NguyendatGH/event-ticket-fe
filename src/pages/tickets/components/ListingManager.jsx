import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppConfig, useCancelListing, useUpdateListing } from "@/api";
import { ConfirmDialog, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatVND } from "@/lib/format";
import { applyApiErrors, v, z } from "@/lib/forms";

/**
 * Thẻ tin bán lại của vé (hiện trong TicketDetailPage, dưới vé điện tử): đổi giá (useUpdateListing → PUT /resale/listings/{id})
 * và gỡ tin (useCancelListing → DELETE, có hộp xác nhận).
 * RESERVED = đang có người thanh toán → khóa thao tác.
 * Schema giá viết riêng ở đây (không dùng priceSchema của pages/resale/lib.js) vì câu thông báo lỗi khác.
 */
export function ListingManager({ ticket }) {
  const { listing } = ticket;
  const max = ticket.maxResalePrice ?? Math.floor(ticket.price * 1.2);
  const active = listing.status === "ACTIVE";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { resaleMinPrice } = useAppConfig(); // giá sàn BE cấu hình

  const schema = useMemo(() => z.object({ price: v.int("Giá bán", { min: resaleMinPrice, max }) }), [resaleMinPrice, max]);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { price: listing.price } });
  const { errors, isDirty } = form.formState;

  const update = useUpdateListing();
  const cancel = useCancelListing();

  const onSubmit = form.handleSubmit(({ price }) => {
    update.mutate(
      { id: listing.id, price },
      {
        onSuccess: (l) => {
          form.reset({ price: l?.price ?? price });
          toast.success("Đã cập nhật giá bán.");
        },
        onError: (err) => {
          const isPriceError = err.errors?.length || err.code === "PRICE_OUT_OF_RANGE";
          if (!isPriceError) {
            toast.error(err.message);
            return;
          }
          // Lỗi về giá hiện ngay dưới ô giá: BE gửi errors[] theo field thì đổ vào đúng field,
          // không gán được field nào thì gắn message chung vào ô "price".
          const assigned = applyApiErrors(form, err, { root: false });
          if (!assigned) form.setError("price", { type: "server", message: err.message });
        },
      }
    );
  });

  const doCancel = () =>
    cancel.mutate(listing.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success("Đã gỡ tin bán lại. Vé vẫn thuộc về bạn.");
      },
      onError: (err) => {
        setConfirmOpen(false);
        toast.error(err.message);
      },
    });

  return (
    <section aria-labelledby="listing-title" className="rounded-card bg-card p-5 ring-1 ring-white/5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 id="listing-title" className="text-lg font-bold text-foreground">
            Tin bán lại
          </h2>
          <StatusBadge kind="listing" status={listing.status} />
        </div>
        <Link to={`/resale/${listing.id}`} className="arrow-nudge inline-flex items-center gap-1 text-sm font-semibold link-accent">
          Xem tin bán <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg bg-page/60 px-4 py-3.5 tabular-nums">
        <span className="text-sm text-muted-foreground">Đang rao</span>
        <span className="text-xl font-bold text-primary">{formatVND(listing.price)}</span>
        <span className="text-sm text-muted-foreground">Giá gốc {formatVND(ticket.price)}</span>
      </div>

      {active ? (
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <form onSubmit={onSubmit} noValidate className="w-full max-w-md space-y-2">
            <Label htmlFor="listing-price" className="text-secondary-foreground">
              Đổi giá bán
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  id="listing-price"
                  type="number"
                  inputMode="numeric"
                  step={1000}
                  min={resaleMinPrice}
                  max={max}
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby="listing-price-help"
                  className="pr-8 tabular-nums"
                  {...form.register("price")}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">đ</span>
              </div>
              <Button type="submit" variant="secondary" disabled={update.isPending || !isDirty}>
                {update.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                Cập nhật
              </Button>
            </div>
            <p id="listing-price-help" className={errors.price ? "text-meta text-destructive" : "text-meta text-muted-foreground"}>
              {errors.price?.message || `Từ ${formatVND(resaleMinPrice)} đến ${formatVND(max)}.`}
            </p>
          </form>
          <Button variant="destructive" className="self-start md:mb-7 md:self-auto" onClick={() => setConfirmOpen(true)}>
            Gỡ tin bán
          </Button>
        </div>
      ) : (
        <p className="mt-5 max-w-[60ch] text-sm text-muted-foreground">
          Có người đang thanh toán vé này. Chờ kết quả trước khi đổi giá hoặc gỡ tin; nếu giao dịch không thành công, tin sẽ tự mở lại.
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Gỡ tin bán lại?"
        description="Vé sẽ không còn hiển thị trên chợ vé. Bạn vẫn giữ vé và có thể đăng bán lại sau."
        confirmLabel="Gỡ tin"
        cancelLabel="Giữ tin"
        destructive
        loading={cancel.isPending}
        onConfirm={doCancel}
      />
    </section>
  );
}
