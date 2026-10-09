// Phiên đăng nhập (persist localStorage key "nhip.auth").

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const EMPTY = { accessToken: null, refreshToken: null, expiresAt: null, user: null };
const AUTH_STORAGE_KEY = "nhip.auth";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...EMPTY,
      setSession: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken ?? get().refreshToken,
          expiresAt: auth.expiresIn ? Date.now() + auth.expiresIn * 1000 : null,
          user: auth.user ?? get().user,
        }),
      setUser: (user) => set({ user }),
      clear: () => set(EMPTY),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken, refreshToken, expiresAt, user }) => ({ accessToken, refreshToken, expiresAt, user }),
    }
  )
);

export const isAccessTokenExpired = (state = useAuthStore.getState(), skewMs = 10_000) =>
  Boolean(state.accessToken && state.expiresAt && Date.now() >= state.expiresAt - skewMs);

export const hasSession = (state = useAuthStore.getState()) => Boolean(state.accessToken || state.refreshToken);

export const isOrganizerRole = (user) => user?.role === "ORGANIZER" || user?.role === "ADMIN";
export const isAdminRole = (user) => user?.role === "ADMIN";

export function readPersistedSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.state ?? null;
  } catch {
    return null;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === AUTH_STORAGE_KEY || e.key === null) useAuthStore.persist.rehydrate();
  });
}
