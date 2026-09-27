import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, isOrganizerRole } from "@/stores/auth";
import { api } from "@/api";

/**
 * Trạng thái đăng nhập cho component.
 *   const { user, isAuthenticated, isOrganizer, logout } = useAuth();
 * isAuthenticated = có access hoặc refresh token (access hết hạn vẫn tự refresh).
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken || s.refreshToken));
  const qc = useQueryClient();

  const logout = useCallback(async () => {
    const { refreshToken, clear } = useAuthStore.getState();
    if (refreshToken) await api.auth.logout(refreshToken).catch(() => {}); // token lạ/lỗi mạng: vẫn đăng xuất phía client
    clear();
    qc.clear();
  }, [qc]);

  return {
    user,
    isAuthenticated,
    isOrganizer: isAuthenticated && isOrganizerRole(user),
    logout,
  };
}

/** Link "Tạo sự kiện": organizer → wizard; đã đăng nhập → trở thành BTC; khách → đăng ký BTC (contract §6.2). */
export function createEventHref({ isAuthenticated, isOrganizer }) {
  if (isOrganizer) return "/organizer/events/new";
  return isAuthenticated ? "/become-organizer" : "/auth/register-organizer";
}
