import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resaleApi from "../services/resale";
import { cleanParams } from "../params";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { withAfter } from "./withAfter";

/** GET /resale (infinite). params: q, category, city, eventId, priceMin, priceMax, sort */
export const useResaleListings = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.resale.list(clean), resaleApi.list, clean), ...options });
};

/** GET /resale/{id} */
export const useResaleListing = (id, options) =>
  useQuery({ queryKey: qk.resale.detail(id), queryFn: () => resaleApi.get(id), enabled: Boolean(id), ...options });

/** GET /resale/{id}/history */
export const useResaleHistory = (id, options) =>
  useQuery({ queryKey: qk.resale.history(id), queryFn: () => resaleApi.history(id), enabled: Boolean(id), ...options });

/** GET /resale/{id}/related */
export const useRelatedListings = (id, limit = 4, options) =>
  useQuery({ queryKey: qk.resale.related(id, limit), queryFn: () => resaleApi.related(id, limit), enabled: Boolean(id), ...options });

/** Listing thay đổi → làm mới marketplace và vé của tôi. */
function useAfterListingChange() {
  const qc = useQueryClient();
  return (listing) => {
    if (listing?.id) qc.setQueryData(qk.resale.detail(listing.id), listing);
    qc.invalidateQueries({ queryKey: qk.resale.all });
    qc.invalidateQueries({ queryKey: qk.me.all });
  };
}

/** POST /resale/listings. mutate({ ticketId, price }) */
export function useCreateListing(options = {}) {
  const after = useAfterListingChange();
  return useMutation(withAfter({ mutationFn: resaleApi.createListing, ...options }, after));
}

/** PUT /resale/listings/{id}. mutate({ id, price }) */
export function useUpdateListing(options = {}) {
  const after = useAfterListingChange();
  return useMutation(withAfter({ mutationFn: ({ id, price }) => resaleApi.updateListing(id, { price }), ...options }, after));
}

/** DELETE /resale/listings/{id}. mutate(id) */
export function useCancelListing(options = {}) {
  const after = useAfterListingChange();
  return useMutation(withAfter({ mutationFn: resaleApi.cancelListing, ...options }, after));
}

/**
 * POST /resale/{id}/orders. mutate({ id, phone, idempotencyKey }) → OrderResponse;
 * onSuccess: window.location.assign(order.payment.checkoutUrl).
 */
export function useBuyResale(options = {}) {
  const qc = useQueryClient();
  return useMutation(
    withAfter({ mutationFn: ({ id, phone, idempotencyKey }) => resaleApi.buy(id, phone ? { phone } : {}, { idempotencyKey }), ...options }, (order) => {
      qc.setQueryData(qk.orders.detail(order.id), order);
      qc.invalidateQueries({ queryKey: qk.resale.all });
    })
  );
}
