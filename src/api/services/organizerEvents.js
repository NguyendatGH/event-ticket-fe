import { client } from "../client";
import { cleanParams } from "../params";

/** Quản lý sự kiện phía organizer, contract §4.4 */

/** GET /organizer/events?status&q&page&size → Page<OrganizerEventSummary> */
export const list = (params) => client.get("/organizer/events", { params: cleanParams(params) });

/** POST /organizer/events EventUpsertRequest → 201 OrganizerEventDetail (DRAFT) */
export const create = (body) => client.post("/organizer/events", body);

/** GET /organizer/events/{id} → OrganizerEventDetail */
export const get = (id) => client.get(`/organizer/events/${id}`);

/** PUT /organizer/events/{id} EventUpsertRequest → OrganizerEventDetail */
export const update = (id, body) => client.put(`/organizer/events/${id}`, body);

/** POST /organizer/events/{id}/publish → OrganizerEventDetail (400 EVENT_INCOMPLETE + errors[]) */
export const publish = (id) => client.post(`/organizer/events/${id}/publish`);

/** DELETE /organizer/events/{id} → 204 (chỉ DRAFT chưa có đơn) */
export const remove = (id) => client.delete(`/organizer/events/${id}`);

/** GET /organizer/events/{id}/orders?status&q&page&size → Page<OrganizerOrderRow> */
export const orders = (id, params) => client.get(`/organizer/events/${id}/orders`, { params: cleanParams(params) });
