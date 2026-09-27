import { client } from "../client";
import { cleanParams } from "../params";

/** Sự kiện public, contract §4.3 */

const enc = encodeURIComponent;

/**
 * GET /events → Page<EventResponse>
 * params: q, category, city, from, to, when, priceMin, priceMax, organizer, sort, includePast, page, size
 */
export const list = (params) => client.get("/events", { params: cleanParams(params) });

/** GET /events/featured → EventResponse[] */
export const featured = () => client.get("/events/featured");

/** GET /events/upcoming?limit → EventResponse[] */
export const upcoming = (limit = 8) => client.get("/events/upcoming", { params: { limit } });

/** GET /events/facets → {categories: [{slug, count}], cities: [{name, count}], price: {min, max}} */
export const facets = () => client.get("/events/facets");

/** GET /events/{idOrSlug} → EventResponse detail */
export const get = (idOrSlug) => client.get(`/events/${enc(idOrSlug)}`);

/** GET /events/{idOrSlug}/related?limit → EventResponse[] */
export const related = (idOrSlug, limit = 4) => client.get(`/events/${enc(idOrSlug)}/related`, { params: { limit } });

/** GET /events/{idOrSlug}/more-from-organizer?limit → EventResponse[] */
export const moreFromOrganizer = (idOrSlug, limit = 4) =>
  client.get(`/events/${enc(idOrSlug)}/more-from-organizer`, { params: { limit } });
