import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../services/users";
import { qk } from "./keys";
import { withAfter } from "./withAfter";

/** PUT /users/me → ghi vào cache /auth/me (nguồn user duy nhất; RootLayout đồng bộ sang store). */
export function useUpdateProfile(options = {}) {
  const qc = useQueryClient();
  return useMutation(withAfter({ mutationFn: usersApi.updateMe, ...options }, (user) => qc.setQueryData(qk.auth.me, user)));
}

/** PUT /users/me/password (400 WRONG_PASSWORD, errors field currentPassword) */
export const useChangePassword = (options) => useMutation({ mutationFn: usersApi.changePassword, ...options });
