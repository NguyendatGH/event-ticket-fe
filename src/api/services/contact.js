import { client } from "../client";

export const send = (body) => client.post("/contact", body);
