// Đăng ký / đăng nhập / quên mật khẩu, contract §4.1. Trả body BE nguyên shape (AuthResponse, UserResponse…).

import { client } from "../client";

export const register = (body) => client.post("/auth/register", body);

export const registerOrganizer = (body) => client.post("/auth/register-organizer", body);

export const login = (body) => client.post("/auth/login", body);

export const googleLogin = (idToken) => client.post("/auth/google", { idToken });

export const logout = (refreshToken) => client.post("/auth/logout", { refreshToken });

export const me = () => client.get("/auth/me");

export const forgotPassword = (body) => client.post("/auth/forgot-password", body);

export const resetPassword = (body) => client.post("/auth/reset-password", body);
