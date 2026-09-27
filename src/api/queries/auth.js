import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../services/auth";
import { useAuthStore, hasSession } from "@/stores/auth";
import { qk, USER_SCOPED_KEYS } from "./keys";
import { withAfter } from "./withAfter";

/** Lưu phiên từ AuthResponse và bỏ cache của người dùng trước. */
function useApplySession() {
  const qc = useQueryClient();
  return (auth) => {
    useAuthStore.getState().setSession(auth);
    USER_SCOPED_KEYS.forEach((queryKey) => qc.removeQueries({ queryKey }));
    if (auth.user) qc.setQueryData(qk.auth.me, auth.user);
    return auth;
  };
}

/** Hook mutation trả AuthResponse → lưu phiên (login, register, trở thành BTC…). */
export const sessionMutation = (mutationFn) =>
  function useSessionMutation(options = {}) {
    const applySession = useApplySession();
    return useMutation(withAfter({ mutationFn, ...options }, applySession));
  };

/** POST /auth/login → lưu phiên */
export const useLogin = sessionMutation(authApi.login);
/** POST /auth/register → lưu phiên */
export const useRegister = sessionMutation(authApi.register);
/** POST /auth/register-organizer → lưu phiên (role ORGANIZER) */
export const useRegisterOrganizer = sessionMutation(authApi.registerOrganizer);

/** GET /auth/me: chỉ chạy khi có phiên; kết quả đồng bộ vào store (xem RootLayout). */
export function useMe(options = {}) {
  const enabled = useAuthStore(hasSession);
  return useQuery({ queryKey: qk.auth.me, queryFn: authApi.me, enabled, staleTime: 5 * 60_000, ...options });
}

/** POST /auth/forgot-password */
export const useForgotPassword = (options) => useMutation({ mutationFn: authApi.forgotPassword, ...options });

/** POST /auth/reset-password */
export const useResetPassword = (options) => useMutation({ mutationFn: authApi.resetPassword, ...options });
