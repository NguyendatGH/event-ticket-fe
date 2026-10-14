import { client } from "../client";

const enc = encodeURIComponent;

export const becomeOrganizer = (body) => client.post("/me/organizer", body);

export const getMyProfile = () => client.get("/organizer/profile");

export const updateMyProfile = (body) => client.put("/organizer/profile", body);

export const listFeatured = (params = {}) =>
  client.get("/organizers", { params }).then((data) => (Array.isArray(data) ? data : (data?.content ?? [])));

export const getPublic = (idOrSlug) => client.get(`/organizers/${enc(idOrSlug)}`);

export const listEvents = (idOrSlug, params = {}) => client.get(`/organizers/${enc(idOrSlug)}/events`, { params });
