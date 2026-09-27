import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";

/** Đường dẫn hiện tại dạng chuỗi, dùng cho state.from. */
const currentPath = (location) => `${location.pathname}${location.search}${location.hash}`;

/**
 * Chưa đăng nhập → /auth/login với state.from = "/me/tickets?scope=past" (chuỗi path).
 * Trang login đọc `location.state?.from` và navigate(from, { replace: true }) sau khi đăng nhập.
 * Phiên hết hạn giữa chừng (refresh thất bại) → store bị xóa → guard tự chuyển về login.
 */
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: currentPath(location) }} />;
  return children ?? <Outlet />;
}

/** Không phải ORGANIZER/ADMIN → /become-organizer. */
export function RequireOrganizer({ children }) {
  const { isAuthenticated, isOrganizer, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: currentPath(location) }} />;
  if (!user) return <PageLoader />; // chờ /auth/me (RootLayout) nạp user
  if (!isOrganizer) return <Navigate to="/become-organizer" replace state={{ from: currentPath(location) }} />;
  return children ?? <Outlet />;
}
