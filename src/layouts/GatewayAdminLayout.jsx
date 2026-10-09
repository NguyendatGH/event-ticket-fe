// Khu quản trị BankSim Gateway. Tách hẳn khỏi Organizer UI (spec §6) — người dùng khác, quyền khác.
import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { PageLoader } from "@/components/site";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/gateway-admin/organizers", label: "Ban tổ chức" },
  { to: "/gateway-admin/acquirers", label: "Acquirers" },
  { to: "/gateway-admin/routing-profiles", label: "Routing Profiles" },
];

export default function GatewayAdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
          <Link to="/gateway-admin/organizers" className="text-sm font-bold tracking-tight">
            BankSim Gateway Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) => cn("text-muted-foreground hover:text-foreground", isActive && "text-foreground")}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/" className="ml-auto text-xs text-muted-foreground hover:text-foreground">← Về Encore</Link>
        </div>
      </header>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
