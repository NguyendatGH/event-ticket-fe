import { client, newIdempotencyKey } from "../client";

export const get = () => client.get("/organizer/wallet");

export const topUp = (body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post("/organizer/wallet/top-ups", body, { headers: { "Idempotency-Key": idempotencyKey } });
