import { client } from "../client";

/** GET /config → { checkoutFee, resaleMinPrice, resaleMaxMarkupPercent, resaleCutoffHours } (public) */
export const get = () => client.get("/config");
