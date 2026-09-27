import { client, newIdempotencyKey } from "../client";
import { cleanParams } from "../params";

/** Vé bán lại, contract §4.6 */

/** GET /resale?q&category&city&eventId&priceMin&priceMax&sort&page&size → Page<ResaleListingResponse> */
export const list = (params) => client.get("/resale", { params: cleanParams(params) });

/** GET /resale/{id} → ResaleListingResponse */
export const get = (id) => client.get(`/resale/${id}`);

/** GET /resale/{id}/history → TicketHistoryItem[] (cũ → mới) */
export const history = (id) => client.get(`/resale/${id}/history`);

/** GET /resale/{id}/related?limit → ResaleListingResponse[] */
export const related = (id, limit = 4) => client.get(`/resale/${id}/related`, { params: { limit } });

/** POST /resale/listings {ticketId, price} → 201 ResaleListingResponse */
export const createListing = (body) => client.post("/resale/listings", body);

/** PUT /resale/listings/{id} {price} → ResaleListingResponse */
export const updateListing = (id, body) => client.put(`/resale/listings/${id}`, body);

/** DELETE /resale/listings/{id} → 204 */
export const cancelListing = (id) => client.delete(`/resale/listings/${id}`);

/**
 * POST /resale/{id}/orders (header Idempotency-Key) body {phone?}
 * → 201 OrderResponse (kind RESALE); FE chuyển tới payment.checkoutUrl.
 */
export const buy = (id, body = {}, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post(`/resale/${id}/orders`, body, { headers: { "Idempotency-Key": idempotencyKey } });
