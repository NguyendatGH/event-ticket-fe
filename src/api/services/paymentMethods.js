import { client } from "../client";

export const publicMethods = (organizerId) => client.get(`/organizers/${encodeURIComponent(organizerId)}/payment-methods`);
