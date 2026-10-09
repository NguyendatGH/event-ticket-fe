import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as walletApi from "../services/buyerWallet";
import { qk } from "./keys";

export const useBuyerWallet = (options = {}) =>
  useQuery({ queryKey: qk.me.wallet, queryFn: walletApi.get, refetchInterval: 5000, ...options });

export function useTopUpBuyerWallet(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletApi.topUp,
    ...options,
    onSuccess: (data, ...rest) => {
      qc.setQueryData(qk.me.wallet, data);
      options.onSuccess?.(data, ...rest);
    },
  });
}
