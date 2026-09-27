import { client } from "../client";
import { cleanParams } from "../params";

/** Dashboard organizer, contract §4.5. params chung: from, to (YYYY-MM-DD), interval (day|week|month), eventId? */

/** GET /organizer/dashboard/summary */
export const summary = (params) => client.get("/organizer/dashboard/summary", { params: cleanParams(params) });

/** GET /organizer/dashboard/sales → [{date, tickets, orders}] */
export const sales = (params) => client.get("/organizer/dashboard/sales", { params: cleanParams(params) });

/** GET /organizer/dashboard/revenue → [{date, revenue}] */
export const revenue = (params) => client.get("/organizer/dashboard/revenue", { params: cleanParams(params) });

/** GET /organizer/dashboard/top-events?limit → [{id, slug, name, startsAt, status, ticketsSold, revenue}] */
export const topEvents = (params) => client.get("/organizer/dashboard/top-events", { params: cleanParams(params) });
