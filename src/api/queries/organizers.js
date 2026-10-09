import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as organizersApi from "../services/organizers";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { sessionMutation } from "./auth";
import { withAfter } from "./withAfter";
import { cleanParams } from "../params";

export const useFeaturedOrganizers = (size = 12, options) =>
  useQuery({ queryKey: qk.organizers.featured(size), queryFn: () => organizersApi.listFeatured({ size }), staleTime: 5 * 60_000, ...options });

export const useOrganizer = (idOrSlug, options) =>
  useQuery({ queryKey: qk.organizers.detail(idOrSlug), queryFn: () => organizersApi.getPublic(idOrSlug), enabled: Boolean(idOrSlug), ...options });

export const useOrganizerPublicEvents = (idOrSlug, params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({
    ...infinitePaged(qk.organizers.events(idOrSlug, clean), (p) => organizersApi.listEvents(idOrSlug, p), clean),
    enabled: Boolean(idOrSlug),
    ...options,
  });
};

export const useBecomeOrganizer = sessionMutation(organizersApi.becomeOrganizer);

export const useMyOrganizerProfile = (options) =>
  useQuery({ queryKey: qk.organizer.profile, queryFn: organizersApi.getMyProfile, ...options });

export function useUpdateOrganizerProfile(options = {}) {
  const qc = useQueryClient();
  return useMutation(
    withAfter({ mutationFn: organizersApi.updateMyProfile, ...options }, (profile) => {
      qc.setQueryData(qk.organizer.profile, profile);
      qc.invalidateQueries({ queryKey: qk.organizers.all });
      qc.invalidateQueries({ queryKey: qk.events.all });
      qc.setQueryData(qk.auth.me, (u) =>
        u?.organizer ? { ...u, organizer: { ...u.organizer, name: profile.name, slug: profile.slug, logoUrl: profile.logoUrl } } : u
      );
    })
  );
}
