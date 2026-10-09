import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../services/users";
import { qk } from "./keys";
import { withAfter } from "./withAfter";

export function useUpdateProfile(options = {}) {
  const qc = useQueryClient();
  return useMutation(withAfter({ mutationFn: usersApi.updateMe, ...options }, (user) => qc.setQueryData(qk.auth.me, user)));
}

export const useChangePassword = (options) => useMutation({ mutationFn: usersApi.changePassword, ...options });
