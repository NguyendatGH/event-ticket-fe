import { client } from "../client";

/** Hồ sơ ban tổ chức, contract §4.2 + §4.3 */

const enc = encodeURIComponent;

/** POST /me/organizer {name, description?, contactEmail?, contactPhone?, website?, city?, logoUrl?} → 201 AuthResponse (role ORGANIZER) */
export const becomeOrganizer = (body) => client.post("/me/organizer", body);

/** GET /organizer/profile → OrganizerResponse */
export const getMyProfile = () => client.get("/organizer/profile");

/** PUT /organizer/profile → OrganizerResponse */
export const updateMyProfile = (body) => client.put("/organizer/profile", body);

/**
 * GET /organizers?size= → OrganizerResponse[] (public): ban tổ chức nổi bật cho trang chủ (BE sắp xếp: verified trước,
 * nhiều sự kiện trước). Nếu BE trả Page thì lấy content, để hook luôn nhận mảng.
 */
export const listFeatured = (params = {}) =>
  client.get("/organizers", { params }).then((data) => (Array.isArray(data) ? data : (data?.content ?? [])));

/** GET /organizers/{idOrSlug} → OrganizerResponse (public) */
export const getPublic = (idOrSlug) => client.get(`/organizers/${enc(idOrSlug)}`);

/** GET /organizers/{idOrSlug}/events?scope=upcoming|past&page&size → Page<EventResponse> */
export const listEvents = (idOrSlug, params = {}) => client.get(`/organizers/${enc(idOrSlug)}/events`, { params });
