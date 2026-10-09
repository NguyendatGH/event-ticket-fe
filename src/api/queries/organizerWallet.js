import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as walletApi from "../services/organizerWallet";
import { qk } from "./keys";

export const useOrganizerWallet = (options = {}) =>
  useQuery({
    queryKey: qk.organizer.wallet,
    queryFn: walletApi.get,
    refetchInterval: 5000,
    ...options,
  });

export function useTopUpOrganizerWallet(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletApi.topUp,
    ...options,
    onSuccess: (data, ...rest) => {
      qc.setQueryData(qk.organizer.wallet, data);
      options.onSuccess?.(data, ...rest);
    },
  });
}
