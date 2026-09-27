import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateListing } from "@/api";
import { Button } from "@/components/ui/button";
import { applyApiErrors } from "@/lib/forms";
import { PriceForm } from "./PriceForm";

/**
 * Vé chưa đăng bán → form đăng bán mới (trang /me/tickets/:id/resell).
 * useCreateListing (POST /resale/listings) → thành công thì mở luôn tin vừa đăng.
 */
export function CreateListing({ ticket }) {
  const navigate = useNavigate();
  const create = useCreateListing();
  return (
    <PriceForm
      original={ticket.price}
      max={ticket.maxResalePrice}
      submitLabel="Đăng bán"
      pending={create.isPending}
      onSubmit={(price, form) =>
        create.mutate(
          { ticketId: ticket.id, price },
          {
            onSuccess: (listing) => {
              toast.success("Đã đăng bán vé", { description: "Tin bán đã xuất hiện trên chợ vé bán lại." });
              navigate(`/resale/${listing.id}`);
            },
            onError: (err) => applyApiErrors(form, err),
          }
        )
      }
      secondaryAction={
        <Button asChild variant="ghost" size="lg">
          <Link to={`/me/tickets/${ticket.id}`}>Hủy</Link>
        </Button>
      }
    >
      <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>Người mua thanh toán xong, vé tự chuyển sang tài khoản của họ và mã QR hiện tại của bạn bị vô hiệu.</li>
        <li>Bạn có thể đổi giá hoặc gỡ tin bất cứ lúc nào trước khi có người mua.</li>
      </ul>
    </PriceForm>
  );
}
