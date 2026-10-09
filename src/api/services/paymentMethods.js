import { client } from "../client";

// Phương thức khách dùng được cho sự kiện của một BTC = những gì terminal của BTC đó đang bật (admin cấu hình).
export const publicMethods = (organizerId) => client.get(`/organizers/${encodeURIComponent(organizerId)}/payment-methods`);
