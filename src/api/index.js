/**
 * Cửa duy nhất để gọi BE. Mọi nơi khác (page, component, layout, hook) import từ "@/api":
 *   import { useEvent, useCreateOrder, ApiError } from "@/api";
 *   useEvent(slug)                 // đọc dữ liệu: hook TanStack Query (cache, loading, error sẵn)
 *   useCreateOrder().mutate(body)  // ghi dữ liệu: hook mutation
 *   api.auth.logout(token)         // hiếm khi cần: gọi thẳng service (trả body BE nguyên shape)
 *
 * Cấu trúc bên trong:
 *   client.js     axios instance: gắn token, tự refresh khi 401, đổi lỗi thành ApiError
 *   errors.js     ApiError + normalizeError
 *   services/*.js mỗi file một nhóm endpoint, chỉ gọi HTTP (không cache)
 *   queries/*.js  hook TanStack Query bọc services (cache, invalidate sau khi ghi)
 *   queries/keys.js  query key cho cache
 */
import * as auth from "./services/auth";
import * as users from "./services/users";
import * as organizers from "./services/organizers";
import * as events from "./services/events";
import * as organizerEvents from "./services/organizerEvents";
import * as dashboard from "./services/dashboard";
import * as orders from "./services/orders";
import * as tickets from "./services/tickets";
import * as resale from "./services/resale";
import * as uploads from "./services/uploads";
import * as contact from "./services/contact";
import * as mockGateway from "./services/mockGateway";
import * as config from "./services/config";

export const api = { auth, users, organizers, events, organizerEvents, dashboard, orders, tickets, resale, uploads, contact, mockGateway, config };

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
export * from "./queries/tickets";
export * from "./queries/resale";
export * from "./queries/uploads";
export * from "./queries/contact";
export * from "./queries/config";
