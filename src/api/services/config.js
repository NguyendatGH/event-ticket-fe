// GET /config → { checkoutFee, googleClientId, banks[] } (public). banks[].supported=false = gateway đang dùng không chi tới BIN đó được, FE disable.

import { client } from "../client";

export const get = () => client.get("/config");
