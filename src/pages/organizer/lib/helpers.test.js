import { describe, expect, it } from "vitest";
import { formatRangeLabel, isoToLocalInput, localInputToIso, resolveRange } from "./helpers";

describe("datetime-local theo giờ VN", () => {
  it("ISO → giá trị input và ngược lại", () => {
    expect(isoToLocalInput("2026-10-24T12:30:00Z")).toBe("2026-10-24T19:30");
    expect(localInputToIso("2026-10-24T19:30")).toBe("2026-10-24T12:30:00.000Z");
    expect(isoToLocalInput(null)).toBe("");
    expect(localInputToIso("")).toBeNull();
  });
});

describe("resolveRange", () => {
  const today = "2026-09-27";
  it("mặc định 30 ngày tính cả hôm nay", () => {
    expect(resolveRange(new URLSearchParams(), today)).toEqual({ range: "30", from: "2026-08-29", to: today, interval: "day" });
  });
  it("preset 7 ngày + gộp theo tuần", () => {
    expect(resolveRange(new URLSearchParams("range=7&interval=week"), today)).toMatchObject({ from: "2026-09-21", to: today, interval: "week" });
  });
  it("tùy chọn hợp lệ / không hợp lệ", () => {
    const ok = resolveRange(new URLSearchParams("range=custom&from=2026-06-01&to=2026-09-27"), today);
    expect(ok).toMatchObject({ range: "custom", from: "2026-06-01", to: "2026-09-27" });
    expect(ok.invalid).toBeUndefined();
    expect(resolveRange(new URLSearchParams("range=custom&from=2026-09-27&to=2026-06-01"), today).invalid).toBe(true);
    expect(resolveRange(new URLSearchParams("range=custom&from=2024-01-01&to=2026-06-01"), today).invalid).toBe(true);
  });
  it("nhãn khoảng ngày", () => {
    expect(formatRangeLabel("2026-09-01", "2026-09-30")).toBe("01.09 - 30.09.2026");
  });
});
