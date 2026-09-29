// Quản lý sự kiện phía organizer, contract §4.4

import { client } from "../client";
import { cleanParams } from "../params";

export const list = (params) => client.get("/organizer/events", { params: cleanParams(params) });

export const create = (body) => client.post("/organizer/events", body);

export const get = (id) => client.get(`/organizer/events/${id}`);

export const update = (id, body) => client.put(`/organizer/events/${id}`, body);

export const publish = (id) => client.post(`/organizer/events/${id}/publish`);

export const remove = (id) => client.delete(`/organizer/events/${id}`);

export const orders = (id, params) => client.get(`/organizer/events/${id}/orders`, { params: cleanParams(params) });
