/**
 * Khối giao diện khu tài khoản khách hàng (design-spec v2): /me/tickets, /me/orders, /me/profile, /become-organizer.
 * Dùng chung giữa layouts/AccountLayout, pages/tickets và pages/account. Luôn import qua barrel này:
 *   import { AccountPageHeader, AccountSection, PillTabs } from "@/components/account";
 */
export { AccountNav } from "./AccountNav";
export { AccountPageHeader } from "./AccountPageHeader";
export { AccountSection } from "./AccountSection";
export { AccountEmpty } from "./AccountEmpty";
export { PillTabs } from "./PillTabs";
export { Perforation } from "./Perforation";
