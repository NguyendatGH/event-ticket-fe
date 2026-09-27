import { client } from "../client";

/** POST /contact {name, email, subject?, message} → 201 {id, createdAt} */
export const send = (body) => client.post("/contact", body);
