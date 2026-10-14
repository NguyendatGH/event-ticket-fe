import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../services/auth";
import { useAuthStore, hasSession } from "@/stores/auth";
import { qk, USER_SCOPED_KEYS } from "./keys";
import { withAfter } from "./withAfter";

function useApplySession() {
  const qc = useQueryClient();
  return (auth) => {
    useAuthStore.getState().setSession(auth);
    USER_SCOPED_KEYS.forEach((queryKey) => qc.removeQueries({ queryKey }));
    if (auth.user) qc.setQueryData(qk.auth.me, auth.user);
    return auth;
  };
}

export const sessionMutation = (mutationFn) =>
  function useSessionMutation(options = {}) {
    const applySession = useApplySession();
    return useMutation(withAfter({ mutationFn, ...options }, applySession));
  };

export const useLogin = sessionMutation(authApi.login);
export const useGoogleLogin = sessionMutation(authApi.googleLogin);
export const useRegister = sessionMutation(authApi.register);
export const useRegisterOrganizer = sessionMutation(authApi.registerOrganizer);

export function useMe(options = {}) {
  const enabled = useAuthStore(hasSession);
  return useQuery({ queryKey: qk.auth.me, queryFn: authApi.me, enabled, staleTime: 5 * 60_000, ...options });
}

export const useForgotPassword = (options) => useMutation({ mutationFn: authApi.forgotPassword, ...options });

export const useResetPassword = (options) => useMutation({ mutationFn: authApi.resetPassword, ...options });
