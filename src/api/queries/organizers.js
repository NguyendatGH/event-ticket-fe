import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as organizersApi from "../services/organizers";
import { qk } from "./keys";
import { infinitePaged } from "./paging";
import { sessionMutation } from "./auth";
import { withAfter } from "./withAfter";
import { cleanParams } from "../params";

/**
 * GET /organizers?size= (public) → OrganizerResponse[] cho hàng "Ban tổ chức nổi bật".
 *   const organizers = useFeaturedOrganizers(12);  // organizers.data = [] khi chưa có BTC nào
 */
export const useFeaturedOrganizers = (size = 12, options) =>
  useQuery({ queryKey: qk.organizers.featured(size), queryFn: () => organizersApi.listFeatured({ size }), staleTime: 5 * 60_000, ...options });

/** GET /organizers/{idOrSlug} (public) */
export const useOrganizer = (idOrSlug, options) =>
  useQuery({ queryKey: qk.organizers.detail(idOrSlug), queryFn: () => organizersApi.getPublic(idOrSlug), enabled: Boolean(idOrSlug), ...options });

/** GET /organizers/{idOrSlug}/events?scope=upcoming|past (infinite) */
export const useOrganizerPublicEvents = (idOrSlug, params = {}, options) => {
  const clean = cleanParams(params);
  return useInfiniteQuery({
    ...infinitePaged(qk.organizers.events(idOrSlug, clean), (p) => organizersApi.listEvents(idOrSlug, p), clean),
    enabled: Boolean(idOrSlug),
    ...options,
  });
};

/** POST /me/organizer → AuthResponse mới (role ORGANIZER) → lưu phiên */
export const useBecomeOrganizer = sessionMutation(organizersApi.becomeOrganizer);

/** GET /organizer/profile */
export const useMyOrganizerProfile = (options) =>
  useQuery({ queryKey: qk.organizer.profile, queryFn: organizersApi.getMyProfile, ...options });

/**
 * PUT /organizer/profile → cập nhật cache hồ sơ, làm mới trang public, và vá user.organizer trong cache /auth/me
 * (RootLayout đồng bộ sang store; không gọi lại /auth/me).
 */
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
