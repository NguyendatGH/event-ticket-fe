import { client } from "../client";
import { cleanParams } from "../params";

export const list = (status) => client.get("/organizer/refunds", { params: cleanParams({ status }) });

export const instruction = (id) => client.get(`/organizer/refunds/${id}/instruction`);

export const resolve = (id, body) => client.post(`/organizer/refunds/${id}/resolve`, body);

export const RUNNING_STATUSES = ["REQUESTED", "AWAITING_FUNDS", "PROCESSING"];

export const hasRunning = (refunds) =>
  Array.isArray(refunds) && refunds.some((r) => RUNNING_STATUSES.includes(r?.status));
