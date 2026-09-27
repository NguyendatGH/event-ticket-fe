import { Suspense, useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { USER_SCOPED_KEYS, onSessionExpired, useMe } from "@/api";
import { useAuthStore } from "@/stores/auth";
import { PageLoader } from "@/components/site";

/**
 * Gốc router:
 * - ScrollRestoration: điều hướng mới → lên đầu trang, Back → vị trí cũ.
 *   Đổi bộ lọc trên cùng trang: setSearchParams(next, { preventScrollReset: true }).
 * - Có token lúc mở app → GET /auth/me đồng bộ user vào store.
 * - Phiên hết hạn (refresh thất bại) → bỏ cache người dùng + thông báo; RequireAuth tự chuyển về /auth/login.
 */
export default function RootLayout() {
  const qc = useQueryClient();
  const me = useMe();

  // /auth/me là nguồn user mới nhất (vd vừa sửa hồ sơ ở tab khác) → chép vào store để Header… dùng.
  useEffect(() => {
    if (me.data) useAuthStore.getState().setUser(me.data);
  }, [me.data]);

  // Phiên hết hạn: xóa cache dữ liệu riêng của người dùng (đơn, vé, hồ sơ…), nếu không người đăng nhập
  // sau trên cùng trình duyệt có thể thoáng thấy dữ liệu của người trước khi cache chưa kịp tải lại.
  // onSessionExpired trả hàm hủy đăng ký → useEffect dùng nó làm cleanup.
  useEffect(
    () =>
      onSessionExpired(() => {
        USER_SCOPED_KEYS.forEach((queryKey) => qc.removeQueries({ queryKey }));
        toast("Phiên đăng nhập đã hết hạn", { description: "Đăng nhập lại để tiếp tục." });
      }),
    [qc]
  );

  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageLoader className="min-h-dvh" />}>
        <Outlet />
      </Suspense>
    </>
  );
}
