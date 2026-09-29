// Hook vé của tôi: danh sách theo scope, chi tiết kèm lịch sử.

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as ticketsApi from "../services/tickets";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { cleanParams } from "../params";

export const useMyTickets = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.me.tickets.list(clean), ticketsApi.mine, clean), ...options });
};

export const useMyTicket = (id, options) =>
  useQuery({ queryKey: qk.me.tickets.detail(id), queryFn: () => ticketsApi.get(id), enabled: Boolean(id), ...options });
