import { client } from "../client";

/**
 * Đăng ký / đăng nhập / quên mật khẩu, contract §4.1. Trả body BE nguyên shape (AuthResponse, UserResponse…).
 * POST /auth/refresh không nằm ở đây: nó được gọi tự động trong api/client.js (refreshSession).
 */

/** POST /auth/register {fullName, email, password} → 201 AuthResponse */
export const register = (body) => client.post("/auth/register", body);

/** POST /auth/register-organizer {fullName, email, password, organizerName, organizerDescription?, contactPhone?, website?, city?} → 201 AuthResponse */
export const registerOrganizer = (body) => client.post("/auth/register-organizer", body);

/** POST /auth/login {email, password} → AuthResponse */
export const login = (body) => client.post("/auth/login", body);

/** POST /auth/logout {refreshToken} → 204 */
export const logout = (refreshToken) => client.post("/auth/logout", { refreshToken });

/** GET /auth/me → UserResponse */
export const me = () => client.get("/auth/me");

/** POST /auth/forgot-password {email} → 202 {sent, expiresInMinutes, devResetUrl?} */
export const forgotPassword = (body) => client.post("/auth/forgot-password", body);

/** POST /auth/reset-password {token, password} → {updated: true} */
export const resetPassword = (body) => client.post("/auth/reset-password", body);
