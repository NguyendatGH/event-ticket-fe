/**
 * Cổng thanh toán GIẢ (chỉ dùng khi phát triển) — route /mock-gateway/checkout/:orderId
 * BE chạy mock gateway (mọi profile trừ payos) thì payment.checkoutUrl trỏ về trang này thay cho cổng thật.
 * Cố ý KHÔNG dùng giao diện của site: đây là "bên thứ ba", nền sáng trung tính.
 * Mỗi nút gọi useMockGatewayAction (POST /mock-gateway/payments/{orderId}/{succeed|fail|expire})
 * rồi về /checkout/return?orderId= như cổng thật.
 */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useMockGatewayAction, useOrder } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { BRAND } from "@/lib/constants";
import { formatDateTime, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 3 kết quả giả lập được: thành công / thất bại / hết hạn. */
const ACTIONS = [
  { key: "succeed", label: "Thanh toán thành công", tone: "primary" },
  { key: "fail", label: "Thanh toán thất bại", tone: "outline" },
  { key: "expire", label: "Hết hạn giao dịch", tone: "plain" },
];

const BTN = {
  primary: "bg-[#1b2a4a] text-white hover:bg-[#23365e]",
  outline: "border border-[#c9ced6] bg-white text-[#1f2933] hover:bg-[#f3f5f8]",
  plain: "text-[#52606d] hover:bg-[#eef1f5] hover:text-[#1f2933]",
};

export default function MockCheckoutPage() {
  useDocumentTitle("Cổng thanh toán thử nghiệm");
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orderQ = useOrder(orderId);
  const order = orderQ.data;
  const [busy, setBusy] = useState(null);
  const gateway = useMockGatewayAction();

  const settle = (action) => {
    setBusy(action);
    gateway.mutate(
      { orderId, action },
      {
        onSuccess: () => navigate(`/checkout/return?orderId=${orderId}`, { replace: true }),
        onError: () => setBusy(null),
      }
    );
  };

  const payable = order?.status === "PENDING_PAYMENT";

  return (
    <div className="min-h-dvh bg-[#eef1f5] font-sans text-[#1f2933] [color-scheme:light]">
      <header className="border-b border-[#dde2e8] bg-white">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-5">
          <p className="text-ui font-semibold tracking-tight">
            PayDemo <span className="font-normal text-[#7b8794]">Cổng thanh toán</span>
          </p>
          <span className="rounded-[3px] border border-[#f0c36d] bg-[#fff6e0] px-2 py-0.5 text-2xs font-medium text-[#8a5a00]">
            Môi trường thử nghiệm
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 py-10 md:py-16">
        <div className="rounded-xl border border-[#dde2e8] bg-white">
          {orderQ.isPending ? (
            <div className="grid h-72 place-items-center" role="status">
              <Loader2 className="size-5 animate-spin text-[#7b8794]" aria-hidden="true" />
              <span className="sr-only">Đang tải đơn hàng</span>
            </div>
          ) : orderQ.isError ? (
            <div className="p-8" role="alert">
              <p className="font-semibold">Không tải được giao dịch</p>
              <p className="mt-2 text-sm text-[#52606d]">{orderQ.error?.message}</p>
              <button type="button" onClick={() => orderQ.refetch()} className={cn("mt-6 h-10 rounded-md px-4 text-sm font-medium", BTN.outline)}>
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-[#eef1f5] p-6 md:p-8">
                <p className="text-sm text-[#7b8794]">Thanh toán cho {BRAND.name}</p>
                <p className="mt-2 text-[34px] leading-tight font-semibold tracking-tight tabular-nums">{formatVND(order.totalAmount)}</p>
                <p className="mt-1 text-sm text-[#52606d]">{order.eventName}</p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 border-b border-[#eef1f5] p-6 text-sm md:px-8">
                <dt className="text-[#7b8794]">Mã đơn</dt>
                <dd className="text-right font-mono tabular-nums">{order.orderCode}</dd>
                <dt className="text-[#7b8794]">Người mua</dt>
                <dd className="truncate text-right">{order.customer?.email}</dd>
                {order.expiresAt ? (
                  <>
                    <dt className="text-[#7b8794]">Hết hạn</dt>
                    <dd className="text-right tabular-nums">{formatDateTime(order.expiresAt)}</dd>
                  </>
                ) : null}
              </dl>

              <div className="p-6 md:p-8">
                {payable ? (
                  <>
                    <p className="mb-4 text-sm text-[#52606d]">Chọn kết quả để giả lập phản hồi từ ngân hàng.</p>
                    <div className="grid gap-3">
                      {ACTIONS.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() => settle(a.key)}
                          disabled={Boolean(busy)}
                          className={cn(
                            "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b2a4a] disabled:cursor-not-allowed disabled:opacity-60",
                            BTN[a.tone]
                          )}
                        >
                          {busy === a.key ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                          {a.label}
                        </button>
                      ))}
                    </div>
                    {gateway.isError ? (
                      <p role="alert" className="mt-4 text-sm text-[#c81e1e]">
                        {gateway.error?.message}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div role="status">
                    <p className="font-medium">Giao dịch này đã được xử lý.</p>
                    <Link
                      to={`/checkout/return?orderId=${orderId}`}
                      className={cn("mt-5 inline-flex h-11 items-center rounded-md px-5 text-sm font-medium", BTN.primary)}
                    >
                      Quay lại cửa hàng
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-[#7b8794]">Trang giả lập dùng khi phát triển. Không có khoản tiền thật nào được trừ.</p>
      </main>
    </div>
  );
}
