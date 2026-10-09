import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { client, onSessionExpired } from "./client";
import { ApiError } from "./errors";
import { useAuthStore } from "@/stores/auth";

function mockServer(route) {
  const calls = [];
  client.defaults.adapter = async (config) => {
    calls.push({ method: config.method, url: config.url, auth: config.headers.Authorization, data: config.data });
    await new Promise((r) => setTimeout(r, 5));
    const [status, data] = await route(config);
    const response = { status, data, headers: {}, config, statusText: String(status) };
    if (status >= 400) throw new AxiosError(`HTTP ${status}`, "ERR_BAD_REQUEST", config, null, response);
    return response;
  };
  return calls;
}

const session = (over = {}) =>
  useAuthStore.setState({ accessToken: "old", refreshToken: "r1", expiresAt: Date.now() + 600_000, user: { id: "u1", role: "CUSTOMER" }, ...over });

const AUTH = { accessToken: "new", refreshToken: "r2", expiresIn: 900, tokenType: "Bearer", user: { id: "u1", role: "CUSTOMER" } };

const refreshOk = (config) => {
  if (config.url === "/auth/refresh") return [200, AUTH];
  return config.headers.Authorization === "Bearer new" ? [200, { ok: config.url }] : [401, { code: "UNAUTHORIZED", detail: "Hết hạn" }];
};

const originalAdapter = client.defaults.adapter;
beforeEach(() => useAuthStore.getState().clear());
afterEach(() => {
  client.defaults.adapter = originalAdapter;
});

describe("api client", () => {
  it("401 → refresh → gửi lại request với token mới", async () => {
    session();
    const calls = mockServer(refreshOk);

    await expect(client.get("/me/tickets")).resolves.toEqual({ ok: "/me/tickets" });

    expect(calls.map((c) => `${c.url} ${c.auth ?? "-"}`)).toEqual([
      "/me/tickets Bearer old",
      "/auth/refresh -",
      "/me/tickets Bearer new",
    ]);
    expect(JSON.parse(calls[1].data)).toEqual({ refreshToken: "r1" });
    const s = useAuthStore.getState();
    expect(s.accessToken).toBe("new");
    expect(s.refreshToken).toBe("r2");
    expect(s.expiresAt).toBeGreaterThan(Date.now());
  });

  it("refresh bị từ chối → xóa phiên, báo listener, reject ApiError 401", async () => {
    session();
    const listener = vi.fn();
    const off = onSessionExpired(listener);
    const calls = mockServer((config) =>
      config.url === "/auth/refresh" ? [401, { code: "REFRESH_TOKEN_INVALID", detail: "Phiên đã hết hạn" }] : [401, {}]
    );

    const err = await client.get("/me/orders").catch((e) => e);
    off();

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(calls.filter((c) => c.url === "/me/orders")).toHaveLength(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].code).toBe("REFRESH_TOKEN_INVALID");
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, refreshToken: null, user: null });
  });

  it("nhiều request 401 cùng lúc chỉ refresh một lần (single-flight)", async () => {
    session();
    const calls = mockServer(refreshOk);

    const results = await Promise.all([client.get("/me/tickets"), client.get("/me/orders"), client.get("/users/me")]);

    expect(results.map((r) => r.ok)).toEqual(["/me/tickets", "/me/orders", "/users/me"]);
    expect(calls.filter((c) => c.url === "/auth/refresh")).toHaveLength(1);
    expect(calls.filter((c) => c.auth === "Bearer new")).toHaveLength(3);
  });

  it("access token đã hết hạn → refresh trước khi gửi", async () => {
    session({ expiresAt: Date.now() - 1000 });
    const calls = mockServer(refreshOk);

    await client.get("/users/me");

    expect(calls.map((c) => `${c.url} ${c.auth ?? "-"}`)).toEqual(["/auth/refresh -", "/users/me Bearer new"]);
  });

  it("endpoint auth công khai: không gắn Bearer, 401 không refresh", async () => {
    session();
    const calls = mockServer(() => [401, { code: "BAD_CREDENTIALS", detail: "Email hoặc mật khẩu không đúng" }]);

    const err = await client.post("/auth/login", { email: "a@example.com", password: "x" }).catch((e) => e);

    expect(err.code).toBe("BAD_CREDENTIALS");
    expect(err.message).toBe("Email hoặc mật khẩu không đúng");
    expect(calls).toHaveLength(1);
    expect(calls[0].auth).toBeUndefined();
    expect(useAuthStore.getState().refreshToken).toBe("r1");
  });

  it("lỗi mạng khi refresh → giữ phiên để thử lại sau", async () => {
    session();
    client.defaults.adapter = async (config) => {
      if (config.url === "/auth/refresh") throw new AxiosError("Network Error", "ERR_NETWORK", config);
      throw new AxiosError("401", "ERR_BAD_REQUEST", config, null, { status: 401, data: {}, headers: {}, config });
    };

    const err = await client.get("/me/tickets").catch((e) => e);

    expect(err.status).toBe(401);
    expect(useAuthStore.getState().refreshToken).toBe("r1");
  });

  describe("nhiều tab", () => {
    const otherTabWrites = (state) => localStorage.setItem("nhip.auth", JSON.stringify({ state, version: 0 }));

    it("tab khác đã xoay token → dùng phiên của tab đó, không gửi refresh token cũ", async () => {
      session({ expiresAt: Date.now() - 1000 });
      otherTabWrites({ accessToken: "new", refreshToken: "r2", expiresAt: Date.now() + 600_000, user: { id: "u1", role: "CUSTOMER" } });
      const calls = mockServer(refreshOk);

      await expect(client.get("/me/tickets")).resolves.toEqual({ ok: "/me/tickets" });

      expect(calls.map((c) => `${c.url} ${c.auth ?? "-"}`)).toEqual(["/me/tickets Bearer new"]);
      expect(useAuthStore.getState()).toMatchObject({ accessToken: "new", refreshToken: "r2" });
    });

    it("refresh bị 401 vì tab khác vừa xoay cùng lúc → thử lại một lần với token mới nhất, không đăng xuất", async () => {
      session();
      const listener = vi.fn();
      const off = onSessionExpired(listener);
      const calls = mockServer((config) => {
        if (config.url !== "/auth/refresh") return refreshOk(config);
        const { refreshToken } = JSON.parse(config.data);
        if (refreshToken === "r1") {
          otherTabWrites({ accessToken: "x", refreshToken: "r2", expiresAt: Date.now() - 1000, user: { id: "u1" } });
          return [401, { code: "REFRESH_TOKEN_INVALID" }];
        }
        return refreshToken === "r2" ? [200, { ...AUTH, refreshToken: "r3" }] : [401, {}];
      });

      await expect(client.get("/me/orders")).resolves.toEqual({ ok: "/me/orders" });
      off();

      expect(calls.filter((c) => c.url === "/auth/refresh").map((c) => JSON.parse(c.data).refreshToken)).toEqual(["r1", "r2"]);
      expect(listener).not.toHaveBeenCalled();
      expect(useAuthStore.getState()).toMatchObject({ accessToken: "new", refreshToken: "r3" });
    });

    it("sự kiện storage từ tab khác → store nạp lại phiên mới", async () => {
      session();
      otherTabWrites({ accessToken: "a2", refreshToken: "r2", expiresAt: Date.now() + 600_000, user: { id: "u1" } });

      window.dispatchEvent(new StorageEvent("storage", { key: "nhip.auth" }));

      await vi.waitFor(() => expect(useAuthStore.getState().refreshToken).toBe("r2"));
      expect(useAuthStore.getState().accessToken).toBe("a2");
    });
  });

  it("gắn X-Request-Id cho mọi request", async () => {
    let headers;
    client.defaults.adapter = async (config) => {
      headers = config.headers;
      return { status: 200, data: [], headers: {}, config };
    };
    await client.get("/events/featured");
    expect(headers["X-Request-Id"]).toMatch(/.{8,}/);
    expect(headers.Authorization).toBeUndefined();
  });
});
