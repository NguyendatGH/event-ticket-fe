import { client } from "../client";

/** Vé của tôi, contract §4.6 */

/** GET /me/tickets?scope=upcoming|past|listed|all&page&size → Page<MyTicketResponse> */
export const mine = (params) => client.get("/me/tickets", { params });

/** GET /me/tickets/{id} → MyTicketResponse + history */
export const get = (id) => client.get(`/me/tickets/${id}`);
