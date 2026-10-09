import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";

const currentPath = (location) => `${location.pathname}${location.search}${location.hash}`;

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: currentPath(location) }} />;
  return children ?? <Outlet />;
}

export function RequireOrganizer({ children }) {
  const { isAuthenticated, isOrganizer, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: currentPath(location) }} />;
  if (!user) return <PageLoader />;
  if (!isOrganizer) return <Navigate to="/become-organizer" replace state={{ from: currentPath(location) }} />;
  return children ?? <Outlet />;
}

export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: currentPath(location) }} />;
  if (!user) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children ?? <Outlet />;
}
