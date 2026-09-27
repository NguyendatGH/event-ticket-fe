/**
 * Khung mua vé bán lại ở trang /resale/:id (chỉ phần này có khung nhẹ, theo design-spec).
 * Mua = useBuyResale (POST /resale/listings/{id}/buy, header Idempotency-Key) → tạo đơn RESALE
 * → chuyển sang cổng thanh toán giống luồng checkout thường (xem sơ đồ ở pages/checkout/lib.js).
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { newIdempotencyKey, useBuyResale } from "@/api";
import { StatusBadge } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime, formatVND } from "@/lib/format";
import { applyApiErrors, toPayload, v, z } from "@/lib/forms";
import { rememberPendingOrder } from "@/lib/pendingOrder";
import { cn } from "@/lib/utils";
import { formatDiff, priceDiffPct } from "../lib";
import { VerifiedMark } from "./ListingCard";

const phoneSchema = z.object({ phone: v.phone() });

/** Tin không mua được (không phải ACTIVE): tiêu đề + giải thích theo trạng thái. */
const UNAVAILABLE = {
  RESERVED: {
    title: "Đang có người thanh toán",
    text: "Vé đang được giữ cho một đơn thanh toán khác. Nếu đơn đó không hoàn tất, vé sẽ mở bán lại sau ít phút.",
  },
  SOLD: { title: "Vé đã được bán", text: "Tin này đã có người mua. Xem các vé tương tự bên dưới." },
  CANCELLED: { title: "Tin đã gỡ", text: "Người bán đã gỡ tin này nên vé không còn được bán." },
};

/** Phần giá: giá bán lớn (xanh khi không cao hơn giá gốc), giá gốc gạch khi giảm, chênh lệch % (cao hơn → màu cảnh báo). */
function PriceBlock({ listing }) {
  const diff = priceDiffPct(listing.price, listing.originalPrice);
  return (
    <div>
      <p className="text-caption text-muted-foreground">Giá bán</p>
      <p className={cn("mt-1 text-[28px] leading-tight font-semibold tabular-nums", diff > 0 ? "text-foreground" : "text-primary")}>{formatVND(listing.price)}</p>
      <p className="mt-2 text-sm text-muted-foreground tabular-nums">
        Giá gốc <span className={cn(diff < 0 && "line-through decoration-1")}>{formatVND(listing.originalPrice)}</span>
        {diff != null ? (
          <span className={cn("ml-2", diff > 0 ? "text-warning" : diff < 0 ? "text-primary" : "text-muted-foreground")}>
            {diff === 0 ? "(bằng giá gốc)" : `(${formatDiff(diff)})`}
          </span>
        ) : null}
      </p>
    </div>
  );
}

/** Liên kết quản lý khi người xem là người bán: BE trả ticketId khi mine=true. Tin đã bán/gỡ → danh sách vé. */
function ManageMine({ listing }) {
  const open = listing.ticketId && (listing.status === "ACTIVE" || listing.status === "RESERVED");
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-secondary-foreground">
        Đây là tin bán của bạn. {mineStatusText(listing)}
      </p>
      <Button asChild size="lg" variant="secondary" className="w-full">
        <Link to={open ? `/me/tickets/${listing.ticketId}` : "/me/tickets"}>{open ? "Quản lý tin bán" : "Xem vé của tôi"}</Link>
      </Button>
    </div>
  );
}

/** Câu mô tả tin bán của chính người xem, theo trạng thái tin. */
function mineStatusText(listing) {
  if (listing.status === "ACTIVE") return "Bạn có thể đổi giá hoặc gỡ tin bất cứ lúc nào trước khi có người mua.";
  if (listing.status === "RESERVED") return "Một người mua đang thanh toán, tạm thời không thể đổi giá hay gỡ tin.";
  if (listing.status === "SOLD") {
    return `Vé đã được bán${listing.soldAt ? ` lúc ${formatDateTime(listing.soldAt)}` : ""} và chuyển cho người mua.`;
  }
  return "Bạn đã gỡ tin này, vé vẫn thuộc về bạn.";
}

/** Tin không mua được (đang giữ / đã bán / đã gỡ): giải thích + nút mờ. */
function UnavailableNote({ listing, unavailable }) {
  return (
    <div className="space-y-4" role="status">
      <div>
        <p className="text-sm font-medium text-foreground">{unavailable.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {unavailable.text}
          {listing.status === "SOLD" && listing.soldAt ? ` Thời điểm bán: ${formatDateTime(listing.soldAt)}.` : null}
        </p>
      </div>
      <Button size="lg" className="w-full" disabled>
        Không thể mua
      </Button>
    </div>
  );
}

/** Khách chưa đăng nhập: mời đăng nhập / đăng ký, quay lại đúng tin này sau đó (state.from). */
function LoginToBuy({ from }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-secondary-foreground">Đăng nhập để mua vé. Vé sẽ được chuyển vào tài khoản của bạn sau khi thanh toán.</p>
      <Button asChild size="lg" className="w-full">
        <Link to="/auth/login" state={{ from }}>
          <LogIn aria-hidden="true" />
          Đăng nhập để mua
        </Link>
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link to="/auth/register" state={{ from }} className="link-accent">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}

/**
 * Nội dung phần dưới của khung, theo thứ tự ưu tiên:
 *   tin của mình → ManageMine · tin không ACTIVE → UnavailableNote · chưa đăng nhập → LoginToBuy · còn lại → form mua.
 */
export function BuyPanel({ listing, onUnavailable }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(phoneSchema), defaultValues: { phone: user?.phone || "" } });
  const buy = useBuyResale();
  const from = `/resale/${listing.id}`;

  const onSubmit = form.handleSubmit((values) => {
    // Idempotency-Key: mỗi lần bấm là một yêu cầu mua mới → key mới. Request bị gửi lại với cùng key
    // (mạng chập chờn) thì BE trả lại đúng đơn cũ. Nút bị khóa khi đang gửi nên không bấm trùng.
    buy.mutate(
      { id: listing.id, phone: toPayload(values).phone, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: (order) => {
          rememberPendingOrder(order.id);
          const url = order.payment?.checkoutUrl;
          if (url) window.location.assign(url);
          else navigate(`/orders/${order.id}`);
        },
        onError: (err) => {
          if (err.code === "LISTING_NOT_AVAILABLE") {
            toast.error("Vé vừa có người khác giữ chỗ hoặc đã bán.");
            onUnavailable?.();
          } else if (err.status === 401) {
            navigate("/auth/login", { state: { from } });
          } else {
            // Lỗi theo field (vd số điện thoại) → hiện dưới ô; không gán được field nào → toast.
            const assigned = applyApiErrors(form, err, { root: false });
            if (!assigned) toast.error(err.message);
          }
        },
      }
    );
  });

  const unavailable = UNAVAILABLE[listing.status];
  const redirecting = buy.isSuccess;

  return (
    <div className="border border-border bg-background-2 p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Hạng vé</p>
          <p className="mt-1.5 text-lg font-semibold text-foreground">{listing.tier?.name}</p>
        </div>
        {listing.status !== "ACTIVE" ? <StatusBadge kind="listing" status={listing.status} /> : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <PriceBlock listing={listing} />
        {listing.verified ? (
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <VerifiedMark label="" className="mt-0.5" />
            <span>Vé đã xác thực với đơn hàng gốc. Giá bán nằm trong mức trần cho phép.</span>
          </p>
        ) : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {listing.mine ? (
          <ManageMine listing={listing} />
        ) : unavailable ? (
          <UnavailableNote listing={listing} unavailable={unavailable} />
        ) : !isAuthenticated ? (
          <LoginToBuy from={from} />
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="resale-phone" className="text-sm font-medium text-foreground">
                Số điện thoại <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
              </label>
              <Input
                id="resale-phone"
                type="tel"
                autoComplete="tel"
                placeholder="0912 345 678"
                aria-invalid={Boolean(form.formState.errors.phone)}
                aria-describedby="resale-phone-help"
                {...form.register("phone")}
              />
              {form.formState.errors.phone ? (
                <p id="resale-phone-help" className="text-caption text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              ) : (
                <p id="resale-phone-help" className="text-caption text-muted-foreground">
                  Để ban tổ chức liên hệ khi có thay đổi về sự kiện.
                </p>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={buy.isPending || redirecting}>
              {buy.isPending || redirecting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {redirecting ? "Đang chuyển tới thanh toán" : "Mua vé"}
            </Button>
            <p className="text-caption leading-relaxed text-muted-foreground">
              Vé được giữ cho bạn trong thời gian thanh toán. Phí dịch vụ (nếu có) hiển thị ở bước thanh toán. Sau khi thanh toán, vé chuyển sang tài khoản của bạn với mã QR mới.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
