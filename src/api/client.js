import axios from "axios";
import { useAuthStore, isAccessTokenExpired, readPersistedSession } from "@/stores/auth";
import { ApiError, normalizeError } from "./errors";

/**
 * Một axios instance cho toàn FE.
 *
 *   FE ──▶ VITE_API_BASE_URL (/api/v1, vite proxy) ──▶ be-view :8080
 *
 * - Request: X-Request-Id, Bearer từ zustand store; access token hết hạn → refresh trước khi gửi.
 * - Response: trả thẳng body (DTO BE nguyên shape); lỗi → ApiError.
 * - 401 (trừ các endpoint /auth công khai): refresh một lần (single-flight) rồi gửi lại đúng một lần.
 *   Refresh bị từ chối → xóa phiên + báo onSessionExpired (RequireAuth tự đưa về /auth/login).
 * - Nhiều tab: refresh chạy dưới Web Lock "nhip.auth.refresh" (một tab một lúc) và luôn đọc lại localStorage
 *   trước khi gửi: tab khác đã xoay token thì dùng token đó, không gửi refresh token cũ (BE coi là reuse).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;
/** Gốc server (bỏ /api/v1): dùng cho /mock-gateway/payments. Dev = "" (cùng origin, qua proxy). */
export const API_ROOT = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

/** Id ngẫu nhiên (UUID nếu trình duyệt hỗ trợ). */
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/** Mỗi lần bấm "Thanh toán" một key; gửi lại cùng key khi retry để BE trả lại đúng đơn cũ. */
export const newIdempotencyKey = newId;

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { Accept: "application/json" },
});

// Endpoint auth công khai: không gắn Bearer (Bearer hết hạn trên permitAll vẫn bị 401) và không refresh-on-401.
const PUBLIC_AUTH = /\/auth\/(login|register|register-organizer|refresh|logout|forgot-password|reset-password)\/?$/;
const isPublicAuth = (url = "") => PUBLIC_AUTH.test(url.split("?")[0]);

/* ---------------- Phiên hết hạn ---------------- */

const sessionListeners = new Set();

/** Đăng ký nghe sự kiện "phiên hết hạn" (refresh thất bại). Trả về hàm hủy. */
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

/* ---------------- Refresh (single-flight, cả giữa các tab) ---------------- */

// Promise refresh đang chạy (null = không có). Nhiều request cùng hết hạn / cùng nhận 401 một lúc
// thì chỉ gọi POST /auth/refresh MỘT lần, các request còn lại chờ chung promise này ("single-flight").
// Vì sao quan trọng: refresh token xoay vòng; gửi cùng một refresh token hai lần thì lần sau BE coi là
// token cũ bị dùng lại (reuse) và thu hồi cả phiên → người dùng bị đăng xuất vô cớ.
let refreshing = null;

const REFRESH_LOCK = "nhip.auth.refresh";
/** Khóa giữa các tab cùng origin; trình duyệt không có Web Locks → chạy thẳng (vẫn còn bước đọc lại storage). */
const withRefreshLock = (fn) =>
  typeof navigator !== "undefined" && navigator.locks?.request ? navigator.locks.request(REFRESH_LOCK, fn) : fn();

/** Token còn dùng được (có và chưa hết hạn). */
const usableAccess = (s) => (s?.accessToken && !isAccessTokenExpired(s) ? s.accessToken : null);

/**
 * Tab khác đã xoay refresh token (khác `staleRefreshToken`) → nhận phiên đó vào store. Trả true nếu đã nhận.
 */
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
  // Trong lúc chờ khóa, tab khác có thể đã refresh xong: dùng luôn access token mới của nó.
  if (adoptOtherTabSession(staleRefreshToken)) {
    const token = usableAccess(useAuthStore.getState());
    if (token) return token;
  }
  const sent = useAuthStore.getState().refreshToken;
  try {
    return await postRefresh(sent);
  } catch (err) {
    // Bị từ chối vì tab khác xoay token cùng lúc (không có Web Locks): thử lại đúng một lần với token mới nhất.
    if (normalizeError(err).status === 401 && adoptOtherTabSession(sent)) {
      return usableAccess(useAuthStore.getState()) ?? (await postRefresh(useAuthStore.getState().refreshToken));
    }
    throw err;
  }
}

/**
 * Gọi POST /auth/refresh đúng một lần cho mọi request đang chờ.
 * Resolve accessToken mới; reject ApiError. BE từ chối (4xx) → xóa phiên; lỗi mạng → giữ phiên để thử lại sau.
 */
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

/* ---------------- Interceptors ---------------- */

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
      // Đánh dấu để request gửi lại mà vẫn 401 thì không refresh nữa (tránh vòng lặp vô hạn).
      config._retried = true;
      try {
        await refreshSession();
      } catch {
        return Promise.reject(normalizeError(error));
      }
      return client(config);
    }
    // Có access token nhưng không có refresh token (phiên cũ) → coi như hết phiên.
    if (canRetry && useAuthStore.getState().accessToken) expireSession(normalizeError(error));
    return Promise.reject(normalizeError(error));
  }
);
