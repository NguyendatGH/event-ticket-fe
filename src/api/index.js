// Cửa duy nhất để gọi BE. Mọi nơi khác (page, component, layout, hook) import từ "@/api".

import * as auth from "./services/auth";
import * as users from "./services/users";
import * as organizers from "./services/organizers";
import * as events from "./services/events";
import * as organizerEvents from "./services/organizerEvents";
import * as dashboard from "./services/dashboard";
import * as orders from "./services/orders";
import * as refunds from "./services/refunds";
import * as tickets from "./services/tickets";
import * as uploads from "./services/uploads";
import * as contact from "./services/contact";
import * as config from "./services/config";

export const api = { auth, users, organizers, events, organizerEvents, dashboard, orders, refunds, tickets, uploads, contact, config };

export { onSessionExpired, newIdempotencyKey } from "./client";
export { ApiError, normalizeError } from "./errors";
export { qk, USER_SCOPED_KEYS } from "./queries/keys";
export * from "./queries/paging";
export * from "./queries/auth";
export * from "./queries/users";
export * from "./queries/organizers";
export * from "./queries/events";
export * from "./queries/organizerEvents";
export * from "./queries/dashboard";
export * from "./queries/orders";
export * from "./queries/refunds";
export * from "./queries/tickets";
export * from "./queries/uploads";
export * from "./queries/contact";
export * from "./queries/config";
