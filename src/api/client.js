// Một axios instance cho toàn FE.

import axios from "axios";
import { useAuthStore, isAccessTokenExpired, readPersistedSession } from "@/stores/auth";
import { ApiError, normalizeError } from "./errors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export const newIdempotencyKey = newId;

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { Accept: "application/json" },
});

const PUBLIC_AUTH = /\/auth\/(login|register|register-organizer|google|refresh|logout|forgot-password|reset-password)\/?$/;
const isPublicAuth = (url = "") => PUBLIC_AUTH.test(url.split("?")[0]);

const sessionListeners = new Set();

export const onSessionExpired = (fn) => {
  sessionListeners.add(fn);
  return () => sessionListeners.delete(fn);
};

function expireSession(error) {
  useAuthStore.getState().clear();
  sessionListeners.forEach((fn) => {
    try {
      fn(error);
    } catch {
      /* listener lỗi không được chặn luồng */
    }
  });
}

let refreshing = null;

const REFRESH_LOCK = "nhip.auth.refresh";
const withRefreshLock = (fn) =>
  typeof navigator !== "undefined" && navigator.locks?.request ? navigator.locks.request(REFRESH_LOCK, fn) : fn();

const usableAccess = (s) => (s?.accessToken && !isAccessTokenExpired(s) ? s.accessToken : null);

function adoptOtherTabSession(staleRefreshToken) {
  const saved = readPersistedSession();
  if (!saved?.refreshToken || saved.refreshToken === staleRefreshToken) return false;
  const { accessToken, refreshToken, expiresAt, user } = saved;
  useAuthStore.setState({ accessToken, refreshToken, expiresAt, user: user ?? useAuthStore.getState().user });
  return true;
}

const postRefresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError({ status: 401, code: "REFRESH_TOKEN_MISSING", message: "Phiên đăng nhập đã hết hạn. Đăng nhập lại." });
  }
  const auth = await client.post("/auth/refresh", { refreshToken }, { skipAuth: true });
  useAuthStore.getState().setSession(auth);
  return auth.accessToken;
};

async function doRefresh(staleRefreshToken) {
  if (adoptOtherTabSession(staleRefreshToken)) {
    const token = usableAccess(useAuthStore.getState());
    if (token) return token;
  }
  const sent = useAuthStore.getState().refreshToken;
  try {
    return await postRefresh(sent);
  } catch (err) {
    if (normalizeError(err).status === 401 && adoptOtherTabSession(sent)) {
      return usableAccess(useAuthStore.getState()) ?? (await postRefresh(useAuthStore.getState().refreshToken));
    }
    throw err;
  }
}

export function refreshSession() {
  if (refreshing) return refreshing;
  const stale = useAuthStore.getState().refreshToken;
  refreshing = Promise.resolve()
    .then(() => withRefreshLock(() => doRefresh(stale)))
    .catch((err) => {
      const error = normalizeError(err);
      if (error.status >= 400 && error.status < 500) expireSession(error);
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

client.interceptors.request.use(async (config) => {
  config.headers["X-Request-Id"] = newId();
  if (config.skipAuth || isPublicAuth(config.url)) return config;

  let state = useAuthStore.getState();
  if (isAccessTokenExpired(state) && state.refreshToken) {
    try {
      await refreshSession();
    } catch {
      /* phiên đã bị xóa (hoặc lỗi mạng): gửi tiếp, BE quyết định */
    }
    state = useAuthStore.getState();
  }
  if (state.accessToken) config.headers.Authorization = `Bearer ${state.accessToken}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;
    const canRetry = status === 401 && config && !config._retried && !config.skipAuth && !isPublicAuth(config.url);

    if (canRetry && useAuthStore.getState().refreshToken) {
      config._retried = true;
      try {
        await refreshSession();
      } catch {
        return Promise.reject(normalizeError(error));
      }
      return client(config);
    }
    if (canRetry && useAuthStore.getState().accessToken) expireSession(normalizeError(error));
    return Promise.reject(normalizeError(error));
  }
);
