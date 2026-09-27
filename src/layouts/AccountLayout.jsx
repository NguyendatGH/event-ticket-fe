import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AccountNav } from "@/components/account";
import { Container, PageLoader } from "@/components/site";

/**
 * Khung khu tài khoản khách hàng (design-spec v2), nằm trong SiteLayout (dưới header xanh + thanh danh mục):
 *   ≥ lg: [thẻ menu 272px, dính] [nội dung trang]
 *   < lg: hàng pill menu cuộn ngang ở trên, nội dung bên dưới.
 * Bọc các route /me/tickets, /me/tickets/:id, /me/orders, /me/profile, /become-organizer (router.jsx, sau RequireAuth).
 * Trang con không tự bọc Container; tiêu đề trang dùng AccountPageHeader (@/components/account).
 * Suspense riêng: đổi trang trong khu tài khoản chỉ phần nội dung chờ tải, menu vẫn đứng yên.
 */
export default function AccountLayout() {
  return (
    <Container className="pt-5 pb-20 md:pt-8 lg:pt-10 lg:pb-24">
      <div className="lg:grid lg:grid-cols-[272px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
        <AccountNav />
        <div className="min-w-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
