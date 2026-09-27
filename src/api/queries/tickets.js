import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as ticketsApi from "../services/tickets";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { cleanParams } from "../params";

/** GET /me/tickets?scope (infinite). scope: upcoming | past | listed | all */
export const useMyTickets = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.me.tickets.list(clean), ticketsApi.mine, clean), ...options });
};

/** GET /me/tickets/{id} (kèm history) */
export const useMyTicket = (id, options) =>
  useQuery({ queryKey: qk.me.tickets.detail(id), queryFn: () => ticketsApi.get(id), enabled: Boolean(id), ...options });
