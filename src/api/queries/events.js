import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as eventsApi from "../services/events";
import { cleanParams } from "../params";
import { qk } from "./keys";
import { infinitePaged } from "./paging";

/** GET /events (infinite scroll). params: q, category, city, from, to, when, priceMin, priceMax, organizer, sort, includePast, size */
export const useInfiniteEvents = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.events.list(clean), eventsApi.list, clean), ...options });
};

/** GET /events một trang (khi cần phân trang số thay vì infinite). */
export const useEvents = (params = {}, options) => {
  const clean = cleanParams(params);
  return useQuery({ queryKey: qk.events.list({ ...clean, paged: true }), queryFn: () => eventsApi.list(clean), placeholderData: keepPreviousData, ...options });
};

/** GET /events/featured */
export const useFeaturedEvents = (options) => useQuery({ queryKey: qk.events.featured, queryFn: eventsApi.featured, ...options });

/** GET /events/upcoming?limit */
export const useUpcomingEvents = (limit = 8, options) =>
  useQuery({ queryKey: qk.events.upcoming(limit), queryFn: () => eventsApi.upcoming(limit), ...options });

/** GET /events/facets */
export const useEventFacets = (options) =>
  useQuery({ queryKey: qk.events.facets, queryFn: eventsApi.facets, staleTime: 5 * 60_000, ...options });

/** GET /events/{idOrSlug} */
export const useEvent = (idOrSlug, options) =>
  useQuery({ queryKey: qk.events.detail(idOrSlug), queryFn: () => eventsApi.get(idOrSlug), enabled: Boolean(idOrSlug), ...options });

/** GET /events/{idOrSlug}/related */
export const useRelatedEvents = (idOrSlug, limit = 4, options) =>
  useQuery({ queryKey: qk.events.related(idOrSlug, limit), queryFn: () => eventsApi.related(idOrSlug, limit), enabled: Boolean(idOrSlug), ...options });

/** GET /events/{idOrSlug}/more-from-organizer */
export const useMoreFromOrganizer = (idOrSlug, limit = 4, options) =>
  useQuery({
    queryKey: qk.events.moreFromOrganizer(idOrSlug, limit),
    queryFn: () => eventsApi.moreFromOrganizer(idOrSlug, limit),
    enabled: Boolean(idOrSlug),
    ...options,
  });
