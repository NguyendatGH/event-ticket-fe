import { client, newIdempotencyKey } from "../client";

export const get = () => client.get("/me/wallet");

export const topUp = (body, { idempotencyKey = newIdempotencyKey() } = {}) =>
  client.post("/me/wallet/top-ups", body, { headers: { "Idempotency-Key": idempotencyKey } });
