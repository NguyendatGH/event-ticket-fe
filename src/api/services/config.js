// GET /config → { checkoutFee } (public)

import { client } from "../client";

export const get = () => client.get("/config");
