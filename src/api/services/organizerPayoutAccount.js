import { client } from "../client";

export const get = () => client.get("/organizer/payout-account");

export const save = (body) => client.put("/organizer/payout-account", body);

export const addChannel = (body) => client.post("/organizer/payout-account/channels", body);

export const updateChannel = ({ id, ...body }) => client.put(`/organizer/payout-account/channels/${id}`, body);

export const removeChannel = (id) => client.delete(`/organizer/payout-account/channels/${id}`);
