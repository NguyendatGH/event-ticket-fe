// Trang con không tự bọc Container; tiêu đề trang dùng AccountPageHeader (@/components/account).

import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AccountNav } from "@/components/account";
import { Container, PageLoader } from "@/components/site";

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
