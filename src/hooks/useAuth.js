// Trạng thái đăng nhập cho component: user, isAuthenticated, isOrganizer, logout.

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, isOrganizerRole } from "@/stores/auth";
import { api } from "@/api";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken || s.refreshToken));
  const qc = useQueryClient();

  const logout = useCallback(async () => {
    const { refreshToken, clear } = useAuthStore.getState();
    if (refreshToken) await api.auth.logout(refreshToken).catch(() => {});
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

export function createEventHref({ isAuthenticated, isOrganizer }) {
  if (isOrganizer) return "/organizer/events/new";
  return isAuthenticated ? "/become-organizer" : "/auth/register-organizer";
}
