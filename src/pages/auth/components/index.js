// Barrel component riêng của các trang auth, kèm AUTH_STAGGER.

import { staggerOf } from "@/lib/motion";

export { AuthHeading } from "./AuthHeading";
export { AuthFooter } from "./AuthFooter";
export { GoogleAuthButton } from "./GoogleAuthButton";

export const AUTH_STAGGER = staggerOf(0.05, 0.02);
