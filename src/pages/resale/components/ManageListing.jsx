import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useCancelListing, useUpdateListing } from "@/api";
import { ConfirmDialog, StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { applyApiErrors } from "@/lib/forms";
import { InfoItem } from "./InfoItem";
import { PriceForm } from "./PriceForm";

/**
 * Vé đang có tin bán (trang /me/tickets/:id/resell):
 *   ACTIVE   → đổi giá (useUpdateListing → PUT /resale/listings/{id}) hoặc gỡ tin (useCancelListing → DELETE).
 *   RESERVED → có người đang thanh toán: chỉ giải thích, khóa mọi thao tác.
 */
export function ManageListing({ ticket }) {
  const { listing } = ticket;
  const update = useUpdateListing();
  const cancel = useCancelListing();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reserved = listing.status === "RESERVED";

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <StatusBadge kind="listing" status={listing.status} />
          <p className="text-sm text-secondary-foreground">
            Đang bán với giá <span className="font-semibold text-primary tabular-nums">{formatVND(listing.price)}</span>
          </p>
        </div>
        <Link to={`/resale/${listing.id}`} className="arrow-nudge inline-flex items-center gap-1.5 text-sm link-accent">
          Xem tin bán
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {reserved ? (
        <InfoItem icon={CircleAlert} tone="text-warning" title="Đang có người thanh toán" className="max-w-2xl border-l-2 border-warning pl-4">
          Vé đang được giữ cho một đơn thanh toán. Trong lúc này bạn không thể đổi giá hay gỡ tin. Nếu đơn không hoàn tất, tin sẽ tự mở bán lại.
        </InfoItem>
      ) : (
        <>
          {/* key = giá hiện tại: đổi giá thành công → form tạo lại với giá mới làm giá mặc định. */}
          <PriceForm
            key={listing.price}
            original={ticket.price}
            max={ticket.maxResalePrice}
            defaultPrice={listing.price}
            submitLabel="Cập nhật giá"
            pending={update.isPending}
            onSubmit={(price, form) => {
              if (price === listing.price) {
                toast.info("Giá bán không thay đổi.");
                return;
              }
              update.mutate(
                { id: listing.id, price },
                {
                  onSuccess: () => toast.success("Đã cập nhật giá bán"),
                  onError: (err) => applyApiErrors(form, err),
                }
              );
            }}
            secondaryAction={
              <Button type="button" variant="destructive" size="lg" onClick={() => setConfirmOpen(true)}>
                Gỡ tin bán
              </Button>
            }
          />
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Gỡ tin bán lại?"
            description="Vé sẽ rời khỏi chợ vé bán lại và vẫn thuộc về bạn. Bạn có thể đăng bán lại sau."
            confirmLabel="Gỡ tin"
            destructive
            loading={cancel.isPending}
            onConfirm={() =>
              cancel.mutate(listing.id, {
                onSuccess: () => {
                  setConfirmOpen(false);
                  toast.success("Đã gỡ tin bán");
                },
                onError: (err) => {
                  setConfirmOpen(false);
                  toast.error(err.message);
                },
              })
            }
          />
        </>
      )}
    </div>
  );
}
