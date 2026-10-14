import { client } from "../client";
import { cleanParams } from "../params";

const enc = encodeURIComponent;

export const list = (params) => client.get("/events", { params: cleanParams(params) });

export const featured = () => client.get("/events/featured");

export const upcoming = (limit = 8) => client.get("/events/upcoming", { params: { limit } });

export const facets = () => client.get("/events/facets");

export const get = (idOrSlug) => client.get(`/events/${enc(idOrSlug)}`);

export const related = (idOrSlug, limit = 4) => client.get(`/events/${enc(idOrSlug)}/related`, { params: { limit } });

export const moreFromOrganizer = (idOrSlug, limit = 4) =>
  client.get(`/events/${enc(idOrSlug)}/more-from-organizer`, { params: { limit } });
