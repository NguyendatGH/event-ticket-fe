// Menu tài khoản trên header xanh (desktop).

import { useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, Receipt, ShieldCheck, Ticket, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";

export function HeaderAccountMenu({ user, isOrganizer, isAdmin, onLogout }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 text-left text-white transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <UserAvatar user={user} size="sm" className="rounded-full ring-2 ring-white/70" fallbackClassName="rounded-full bg-white/90 text-header" />
          <span className="hidden max-w-36 truncate text-sm font-semibold xl:inline">{user?.fullName}</span>
          <ChevronDown className="size-4 text-white/85 transition-transform duration-200 ease-out-quint group-data-[state=open]:rotate-180" aria-hidden="true" />
          <span className="sr-only">Mở menu tài khoản</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">{user?.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/me/profile")}>
          <UserRound aria-hidden="true" /> Hồ sơ
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/me/tickets")}>
          <Ticket aria-hidden="true" /> Vé của tôi
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/me/orders")}>
          <Receipt aria-hidden="true" /> Đơn hàng
        </DropdownMenuItem>
        {isOrganizer ? (
          <DropdownMenuItem onSelect={() => navigate("/organizer")}>
            <LayoutDashboard aria-hidden="true" /> Dashboard
          </DropdownMenuItem>
        ) : null}
        {isAdmin ? (
          <DropdownMenuItem onSelect={() => navigate("/gateway-admin/organizers")}>
            <ShieldCheck aria-hidden="true" /> BankSim Gateway Admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut aria-hidden="true" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
