// Test chuẩn hóa mọi lỗi thành ApiError.

import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { ApiError, normalizeError } from "./errors";

const httpError = (status, data, headers = {}) =>
  new AxiosError("x", "ERR_BAD_REQUEST", { url: "/x" }, null, { status, data, headers, config: {} });

describe("normalizeError", () => {
  it("đọc problem+json của BE", () => {
    const e = normalizeError(
      httpError(400, {
        type: "about:blank",
        title: "Bad Request",
        status: 400,
        detail: "Dữ liệu không hợp lệ",
        code: "VALIDATION",
        traceId: "abc123",
        errors: [
          { field: "tiers[0].price", message: "Giá phải ≥ 0" },
          { field: "name", message: "Bắt buộc" },
          { field: "name", message: "Trùng" },
        ],
      })
    );
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toMatchObject({ status: 400, code: "VALIDATION", message: "Dữ liệu không hợp lệ", traceId: "abc123" });
    expect(e.errors).toHaveLength(3);
    expect(e.fieldErrors()).toEqual({ "tiers[0].price": "Giá phải ≥ 0", name: "Bắt buộc" });
  });

  it("thiếu detail/code → thông điệp và mã theo status", () => {
    const e = normalizeError(httpError(409, "", { "x-request-id": "req-1" }));
    expect(e.code).toBe("CONFLICT");
    expect(e.message).toMatch(/xung đột/);
    expect(e.traceId).toBe("req-1");
    expect(e.errors).toEqual([]);
    expect(normalizeError(httpError(503, {})).message).toMatch(/bảo trì/);
    expect(normalizeError(httpError(418, { title: "I'm a teapot" })).message).toBe("Lỗi 418.");
  });

  it("lỗi mạng và timeout", () => {
    const net = normalizeError(new AxiosError("Network Error", "ERR_NETWORK", {}));
    expect(net).toMatchObject({ status: 0, code: "NETWORK", isNetwork: true });
    expect(net.message).toMatch(/Không kết nối/);
    expect(normalizeError(new AxiosError("timeout", "ECONNABORTED", {})).code).toBe("TIMEOUT");
  });

  it("giữ nguyên ApiError, bọc Error thường", () => {
    const api = new ApiError({ status: 404, code: "EVENT_NOT_FOUND", message: "Không tìm thấy" });
    expect(normalizeError(api)).toBe(api);
    const plain = normalizeError(new Error("boom"));
    expect(plain).toMatchObject({ status: 0, code: "UNKNOWN", message: "boom" });
  });
});
