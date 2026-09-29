// Dashboard organizer, contract §4.5. params chung: from, to (YYYY-MM-DD), interval (day|week|month), eventId?

import { client } from "../client";
import { cleanParams } from "../params";

export const summary = (params) => client.get("/organizer/dashboard/summary", { params: cleanParams(params) });

export const sales = (params) => client.get("/organizer/dashboard/sales", { params: cleanParams(params) });

export const revenue = (params) => client.get("/organizer/dashboard/revenue", { params: cleanParams(params) });

export const topEvents = (params) => client.get("/organizer/dashboard/top-events", { params: cleanParams(params) });
