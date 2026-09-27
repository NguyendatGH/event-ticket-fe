import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Phiên đăng nhập (persist localStorage key "nhip.auth").
 * accessToken sống ngắn (expiresIn ~15 phút), refreshToken xoay vòng mỗi lần /auth/refresh.
 * Đọc ngoài React: useAuthStore.getState().
 */
const EMPTY = { accessToken: null, refreshToken: null, expiresAt: null, user: null };
const AUTH_STORAGE_KEY = "nhip.auth";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...EMPTY,
      /** Nhận AuthResponse của BE (login/register/refresh/me/organizer). */
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

/** Access token đã (hoặc sắp, trong `skewMs`) hết hạn. */
export const isAccessTokenExpired = (state = useAuthStore.getState(), skewMs = 10_000) =>
  Boolean(state.accessToken && state.expiresAt && Date.now() >= state.expiresAt - skewMs);

export const hasSession = (state = useAuthStore.getState()) => Boolean(state.accessToken || state.refreshToken);

export const isOrganizerRole = (user) => user?.role === "ORGANIZER" || user?.role === "ADMIN";

/** Phiên đang lưu trong localStorage (có thể do tab khác vừa ghi), null nếu không đọc được. */
export function readPersistedSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.state ?? null;
  } catch {
    return null;
  }
}

/*
 * Đồng bộ nhiều tab: tab khác xoay refresh token / đăng nhập / đăng xuất → nạp lại store từ localStorage.
 * Không có bước này, tab còn giữ refresh token cũ sẽ gửi lại nó; BE coi là reuse và thu hồi cả họ token
 * → mọi tab bị đăng xuất.
 */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === AUTH_STORAGE_KEY || e.key === null) useAuthStore.persist.rehydrate();
  });
}
