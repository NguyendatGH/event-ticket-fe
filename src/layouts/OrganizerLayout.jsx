// "Tạo sự kiện" chỉ còn ở nút topbar (bỏ trùng CTA trong sidebar).

import { Suspense, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Building2, CalendarDays, LayoutDashboard, LogOut, Menu, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo, PageLoader, UserAvatar } from "@/components/site";
import { PageTransition, SlidingIndicator } from "@/components/motion";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/organizer", label: "Tổng quan", icon: LayoutDashboard, match: (p) => p === "/organizer" || p === "/organizer/" },
  { to: "/organizer/events", label: "Sự kiện", icon: CalendarDays, match: (p) => p.startsWith("/organizer/events") },
  { to: "/organizer/refunds", label: "Hoàn tiền", icon: RotateCcw, match: (p) => p.startsWith("/organizer/refunds") },
  { to: "/organizer/profile", label: "Hồ sơ ban tổ chức", icon: Building2, match: (p) => p.startsWith("/organizer/profile") },
];

function SideNav({ onNavigate }) {
  const { pathname } = useLocation();
  const navRef = useRef(null);
  return (
    <nav ref={navRef} aria-label="Ban tổ chức" className="relative flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const active = item.match(pathname);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors focus-ring",
              active ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
      <SlidingIndicator containerRef={navRef} activeKey={pathname} axis="y" className="left-3" />
    </nav>
  );
}

function SidebarBody({ user, onNavigate, onLogout }) {
  const org = user?.organizer;
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6 pb-8">
        <Logo />
        <p className="eyebrow mt-8">Ban tổ chức</p>
        <p className="mt-1 truncate text-sm font-medium text-foreground">{org?.name || user?.fullName}</p>
      </div>
      <SideNav onNavigate={onNavigate} />
      <div className="mt-auto space-y-4 border-t border-border px-6 py-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-1.5 text-sm link-quiet">
          Về trang chủ
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">{user?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label="Đăng xuất">
            <LogOut aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const org = user?.organizer;
  const headerRef = useRef(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => headerRef.current?.toggleAttribute("data-condensed", y > 8));
  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-border bg-background-2 lg:block">
        <SidebarBody user={user} onLogout={handleLogout} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header
          ref={headerRef}
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-transparent bg-background/95 px-5 backdrop-blur-sm transition-colors duration-300 ease-out-quint data-[condensed]:border-border lg:px-10"
        >
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="-ml-2 lg:hidden" aria-label="Mở menu ban tổ chức">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background-2 p-0">
              <SheetTitle className="sr-only">Menu ban tổ chức</SheetTitle>
              <SheetDescription className="sr-only">Điều hướng khu vực ban tổ chức</SheetDescription>
              <SidebarBody user={user} onNavigate={() => setOpen(false)} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-foreground lg:hidden">{org?.name || "Ban tổ chức"}</span>
          <div className="ml-auto flex items-center gap-5">
            {org?.slug ? (
              <Link to={`/organizers/${org.slug}`} className="hidden items-center gap-1 text-sm link-quiet sm:inline-flex">
                Trang công khai
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : null}
            <Button asChild size="sm">
              <Link to="/organizer/events/new">Tạo sự kiện</Link>
            </Button>
          </div>
        </header>

        <main id="main" className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <PageTransition y={0} className="mx-auto w-full max-w-[1240px]">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
