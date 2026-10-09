import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as payoutAccountApi from "../services/organizerPayoutAccount";
import { qk } from "./keys";

export const useOrganizerPayoutAccount = (options) =>
  useQuery({ queryKey: qk.organizer.payoutAccount, queryFn: payoutAccountApi.get, ...options });

// Mọi thao tác trả lại cấu hình mới: ghi thẳng vào cache, và phương thức khách thấy có thể đổi theo.
function usePayoutMutation(mutationFn, options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, ...rest) => {
      qc.setQueryData(qk.organizer.payoutAccount, data);
      qc.invalidateQueries({ queryKey: ["organizer", "payment-methods"] });
      options.onSuccess?.(data, ...rest);
    },
  });
}

export const useSaveOrganizerPayoutAccount = (options) => usePayoutMutation(payoutAccountApi.save, options);

export const useAddPaymentChannel = (options) => usePayoutMutation(payoutAccountApi.addChannel, options);

export const useUpdatePaymentChannel = (options) => usePayoutMutation(payoutAccountApi.updateChannel, options);

export const useRemovePaymentChannel = (options) => usePayoutMutation(payoutAccountApi.removeChannel, options);
