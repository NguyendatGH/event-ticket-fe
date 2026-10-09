import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { CategoryNav, Footer, Header, PageLoader } from "@/components/site";
import { PageTransition } from "@/components/motion";
import { useAppConfig } from "@/api";

function PrefetchAppConfig() {
  useAppConfig();
  return null;
}

export default function SiteLayout() {
  return (
    <div data-shell="marketplace" className="flex min-h-dvh flex-col bg-page">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:text-sm focus:px-3 focus:py-2 focus:text-primary-foreground">
        Bỏ qua điều hướng
      </a>
      <PrefetchAppConfig />
      <Header />
      <CategoryNav />
      <main id="main" className="flex-1">
        <PageTransition>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
