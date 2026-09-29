// Hook sự kiện phía organizer: danh sách, chi tiết, đơn, tạo/sửa/xuất bản/xóa.

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as orgEventsApi from "../services/organizerEvents";
import { cleanParams } from "../params";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { withAfter } from "./withAfter";

export const useOrganizerEvent = (id, options) =>
  useQuery({ queryKey: qk.organizer.events.detail(id), queryFn: () => orgEventsApi.get(id), enabled: Boolean(id), ...options });

export const useInfiniteOrganizerEvents = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.organizer.events.list(clean), orgEventsApi.list, clean), placeholderData: keepPreviousData, ...options });
};

export const useInfiniteOrganizerEventOrders = (id, params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({
    ...infinitePaged(qk.organizer.events.orders(id, clean), (p) => orgEventsApi.orders(id, p), clean),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    ...options,
  });
};

function useAfterEventWrite() {
  const qc = useQueryClient();
  return (detail) => {
    if (detail?.id) qc.setQueryData(qk.organizer.events.detail(detail.id), detail);
    qc.invalidateQueries({ queryKey: qk.organizer.events.all, predicate: (q) => q.queryKey[2] !== "detail" });
    qc.invalidateQueries({ queryKey: qk.organizer.dashboard.all });
    qc.invalidateQueries({ queryKey: qk.events.all });
    qc.invalidateQueries({ queryKey: qk.organizers.all });
  };
}

export function useCreateOrganizerEvent(options = {}) {
  const after = useAfterEventWrite();
  return useMutation(withAfter({ mutationFn: orgEventsApi.create, ...options }, after));
}

export function useUpdateOrganizerEvent(options = {}) {
  const after = useAfterEventWrite();
  return useMutation(withAfter({ mutationFn: ({ id, body }) => orgEventsApi.update(id, body), ...options }, after));
}

export function usePublishOrganizerEvent(options = {}) {
  const after = useAfterEventWrite();
  return useMutation(withAfter({ mutationFn: orgEventsApi.publish, ...options }, after));
}

export function useDeleteOrganizerEvent(options = {}) {
  const qc = useQueryClient();
  const after = useAfterEventWrite();
  return useMutation(
    withAfter({ mutationFn: orgEventsApi.remove, ...options }, (_data, id) => {
      qc.removeQueries({ queryKey: qk.organizer.events.detail(id) });
      after(null);
    })
  );
}
