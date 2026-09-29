// POST /contact {name, email, subject?, message} → 201 {id, createdAt}

import { client } from "../client";

export const send = (body) => client.post("/contact", body);
