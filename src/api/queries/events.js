import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as eventsApi from "../services/events";
import { cleanParams } from "../params";
import { qk } from "./keys";
import { infinitePaged } from "./paging";

export const useInfiniteEvents = (params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({ ...infinitePaged(qk.events.list(clean), eventsApi.list, clean), ...options });
};

export const useEvents = (params = {}, options) => {
  const clean = cleanParams(params);
  return useQuery({ queryKey: qk.events.list({ ...clean, paged: true }), queryFn: () => eventsApi.list(clean), placeholderData: keepPreviousData, ...options });
};

export const useFeaturedEvents = (options) => useQuery({ queryKey: qk.events.featured, queryFn: eventsApi.featured, ...options });

export const useUpcomingEvents = (limit = 8, options) =>
  useQuery({ queryKey: qk.events.upcoming(limit), queryFn: () => eventsApi.upcoming(limit), ...options });

export const useEventFacets = (options) =>
  useQuery({ queryKey: qk.events.facets, queryFn: eventsApi.facets, staleTime: 5 * 60_000, ...options });

export const useEvent = (idOrSlug, options) =>
  useQuery({ queryKey: qk.events.detail(idOrSlug), queryFn: () => eventsApi.get(idOrSlug), enabled: Boolean(idOrSlug), ...options });

export const useRelatedEvents = (idOrSlug, limit = 4, options) =>
  useQuery({ queryKey: qk.events.related(idOrSlug, limit), queryFn: () => eventsApi.related(idOrSlug, limit), enabled: Boolean(idOrSlug), ...options });

export const useMoreFromOrganizer = (idOrSlug, limit = 4, options) =>
  useQuery({
    queryKey: qk.events.moreFromOrganizer(idOrSlug, limit),
    queryFn: () => eventsApi.moreFromOrganizer(idOrSlug, limit),
    enabled: Boolean(idOrSlug),
    ...options,
  });
