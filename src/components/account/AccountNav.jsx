// Menu khu tài khoản: thẻ bên trái từ lg, hàng pill cuộn ngang khi hẹp hơn.

import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Receipt, Store, Ticket, UserRound, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ROLE_LABEL = { CUSTOMER: "Thành viên", ORGANIZER: "Nhà tổ chức", ADMIN: "Quản trị viên" };

function navItems(isOrganizer) {
  return [
    { to: "/me/tickets", label: "Vé của tôi", short: "Vé của tôi", icon: Ticket, active: (p) => p.startsWith("/me/tickets") },
    { to: "/me/orders", label: "Đơn hàng", short: "Đơn hàng", icon: Receipt, active: (p) => p.startsWith("/me/orders") },
    { to: "/me/wallet", label: "Ví Encore", short: "Ví Encore", icon: WalletCards, active: (p) => p.startsWith("/me/wallet") },
    { to: "/me/profile", label: "Thông tin tài khoản", short: "Tài khoản", icon: UserRound, active: (p) => p.startsWith("/me/profile") },
    isOrganizer
      ? { to: "/organizer", label: "Dashboard BTC", short: "Dashboard BTC", icon: LayoutDashboard, active: () => false }
      : { to: "/become-organizer", label: "Trở thành ban tổ chức", short: "Trở thành BTC", icon: Store, active: (p) => p.startsWith("/become-organizer") },
  ];
}

export function AccountNav() {
  const { user, isOrganizer, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const items = navItems(isOrganizer).map((item) => ({ ...item, current: item.active(pathname) }));
  const activeKey = items.find((i) => i.current)?.to;

  const onLogout = async () => {
    navigate("/", { replace: true });
    await logout();
    toast.success("Đã đăng xuất");
  };

  return (
    <>
      <MobilePills items={items} activeKey={activeKey} />

      <aside aria-label="Tài khoản" className="sticky top-[calc(var(--header-h)+1.5rem)] hidden lg:block">
        <div className="overflow-hidden rounded-card bg-card ring-1 ring-white/5">
          <div className="relative flex items-center gap-3.5 border-b border-white/6 px-5 pt-6 pb-5">
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(90%_100%_at_0%_0%,rgba(45,194,117,0.22),transparent_70%)]" />
            <UserAvatar
              user={user}
              size="lg"
              className="relative rounded-full ring-2 ring-primary/70 ring-offset-2 ring-offset-card"
              fallbackClassName="rounded-full bg-primary/15 text-primary font-bold"
            />
            <div className="relative min-w-0">
              <p className="truncate text-base font-bold text-foreground">{user?.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              {user?.role ? <p className="mt-1.5 inline-flex rounded-full bg-primary/12 px-2 py-0.5 text-2xs font-semibold text-primary">{ROLE_LABEL[user.role] || user.role}</p> : null}
            </div>
          </div>

          <nav aria-label="Menu tài khoản" className="p-2">
            <ul className="space-y-0.5">
              {items.map(({ to, label, icon: Icon, current }) => (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
                      current ? "bg-primary/10 text-primary" : "text-secondary-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {current ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" /> : null}
                    <Icon className={cn("size-4.5 shrink-0", current ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mx-3 my-2 border-t border-white/6" />
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-secondary-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              <LogOut className="size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              Đăng xuất
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}

function MobilePills({ items, activeKey }) {
  const listRef = useRef(null);
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[aria-current="page"]');
    if (!list || !el) return;
    list.scrollLeft = el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2;
  }, [activeKey]);

  return (
    <nav aria-label="Menu tài khoản" className="mb-6 lg:hidden">
      <ul ref={listRef} className="relative flex gap-1 overflow-x-auto rounded-full bg-card p-1 no-scrollbar ring-1 ring-white/6">
        {items.map(({ to, short, icon: Icon, current }) => (
          <li key={to} className="shrink-0">
            <Link
              to={to}
              aria-current={current ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                current ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "text-secondary-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
