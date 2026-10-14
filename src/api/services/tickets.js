import { client } from "../client";

export const mine = (params) => client.get("/me/tickets", { params });

export const get = (id) => client.get(`/me/tickets/${id}`);
