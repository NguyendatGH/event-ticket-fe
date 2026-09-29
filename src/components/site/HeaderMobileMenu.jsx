// Danh mục nằm ở CategoryNav, không lặp trong menu này.

import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { riseSm, staggerOf } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { HeaderSearch } from "./HeaderSearch";
import { UserAvatar } from "./UserAvatar";

const menuStagger = staggerOf(0.035, 0.08);

export function HeaderMobileMenu({ open, onOpenChange, links, user, isAuthenticated, isOrganizer, loginState, onSearch, onLogout }) {
  const close = () => onOpenChange(false);
  const accountLinks = [
    ["/me/profile", "Hồ sơ"],
    ["/me/orders", "Đơn hàng"],
  ];
  if (isOrganizer) accountLinks.push(["/organizer", "Dashboard"]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/12 hover:text-white focus-visible:outline-white" aria-label="Mở menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-5 py-5">
          <SheetTitle className="text-left">Menu</SheetTitle>
          <SheetDescription className="sr-only">Điều hướng chính</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          <HeaderSearch onSearch={onSearch} />
          <motion.nav aria-label="Menu di động" className="mt-6 flex flex-col" variants={menuStagger} initial="hidden" animate="show">
            {links.map((item) => (
              <motion.div key={item.label} variants={riseSm}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={close}
                  className={({ isActive }) =>
                    cn(
                      "block border-b border-border py-4 text-base font-medium transition-colors",
                      isActive ? "text-primary" : "text-foreground hover:text-primary"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>

          <div className="mt-auto pt-8">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user?.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col text-sm">
                  {accountLinks.map(([to, label]) => (
                    <Link key={to} to={to} onClick={close} className="py-2 link-quiet">
                      {label}
                    </Link>
                  ))}
                  <button type="button" onClick={onLogout} className="cursor-pointer py-2 text-left link-quiet">
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="secondary">
                  <Link to="/auth/login" state={loginState} onClick={close}>
                    Đăng nhập
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register" onClick={close}>
                    Đăng ký
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
