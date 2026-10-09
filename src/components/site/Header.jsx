// Thanh danh mục đen (CategoryNav) nằm ngay dưới, không dính, do SiteLayout đặt.

import { useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Search, Ticket } from "lucide-react";
import { createEventHref, useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { HeaderAccountMenu } from "./HeaderAccountMenu";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { HeaderSearch } from "./HeaderSearch";
import { LanguageMark } from "./LanguageMark";
import { MobileSearchSheet } from "./MobileSearchSheet";

const barLink = ({ isActive }) =>
  cn(
    "inline-flex items-center gap-2 rounded-sm text-sm font-medium text-white transition-opacity hover:opacity-85",
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
    isActive && "underline decoration-2 underline-offset-8"
  );

export function Header() {
  const { user, isAuthenticated, isOrganizer, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => headerRef.current?.toggleAttribute("data-condensed", y > 8));

  const search = (value) => {
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(value ? `/events?q=${encodeURIComponent(value)}` : "/events");
  };
  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };
  const createHref = createEventHref({ isAuthenticated, isOrganizer });
  const loginState = { from: location.pathname + location.search };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-header text-white transition-shadow duration-300 ease-out-quint data-[condensed]:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.6)]"
    >
      <Container className="flex h-(--header-h) items-center gap-4 lg:gap-8">
        <Logo className="text-[21px] text-white lg:text-2xl" />

        <HeaderSearch variant="shell" onSearch={search} className="hidden w-full max-w-[22rem] lg:flex xl:max-w-[26rem]" />

        <div className="ml-auto hidden items-center gap-6 lg:flex">
          <Link
            to={createHref}
            className="inline-flex h-9 items-center rounded-full border border-white/90 px-5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-header focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Tạo sự kiện
          </Link>
          <NavLink to="/me/tickets" className={barLink}>
            <Ticket className="size-5" aria-hidden="true" />
            Vé của tôi
          </NavLink>
          {isAuthenticated ? (
            <HeaderAccountMenu user={user} isOrganizer={isOrganizer} isAdmin={isAdmin} onLogout={handleLogout} />
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Link to="/auth/login" state={loginState} className={barLink({ isActive: false })}>
                Đăng nhập
              </Link>
              <span aria-hidden="true" className="text-white/70">
                |
              </span>
              <Link to="/auth/register" className={barLink({ isActive: false })}>
                Đăng ký
              </Link>
            </p>
          )}
          <LanguageMark className="hidden xl:inline-flex" />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Tìm kiếm"
            className="grid size-10 cursor-pointer place-items-center rounded-md text-white hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <Link
            to="/me/tickets"
            aria-label="Vé của tôi"
            className="grid size-10 place-items-center rounded-md text-white hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Ticket className="size-5" aria-hidden="true" />
          </Link>
          <HeaderMobileMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            links={[
              { to: "/", label: "Trang chủ", end: true },
              { to: "/events", label: "Tất cả sự kiện" },
              { to: createHref, label: "Tạo sự kiện" },
              { to: "/me/tickets", label: "Vé của tôi" },
            ]}
            user={user}
            isAuthenticated={isAuthenticated}
            isOrganizer={isOrganizer}
            loginState={loginState}
            onSearch={search}
            onLogout={handleLogout}
          />
        </div>
      </Container>
      <MobileSearchSheet open={searchOpen} onOpenChange={setSearchOpen} onSearch={search} />
    </header>
  );
}
