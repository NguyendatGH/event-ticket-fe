// Test helper khu organizer.

import { describe, expect, it } from "vitest";
import { REFUND_NEEDS_ACTION, countRefunds, countRefundsNeedingAction, formatRangeLabel, isoToLocalInput, localInputToIso, refundCancelBlocker, resolveRange } from "./lib";

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

describe("đếm refund cần ban tổ chức xử lý", () => {
  const list = [
    { status: "MANUAL_REVIEW" },
    { status: "AWAITING_FUNDS" },
    { status: "AWAITING_FUNDS" },
    { status: "SUCCEEDED" },
    { status: "PROCESSING" },
  ];
  it("chỉ tính MANUAL_REVIEW và AWAITING_FUNDS", () => {
    expect(REFUND_NEEDS_ACTION).toEqual(["MANUAL_REVIEW", "AWAITING_FUNDS"]);
    expect(countRefundsNeedingAction(list)).toBe(3);
    expect(countRefunds(list, ["SUCCEEDED"])).toBe(1);
  });
  it("chưa có dữ liệu (undefined) thì trả 0 chứ không nổ", () => {
    expect(countRefundsNeedingAction(undefined)).toBe(0);
    expect(countRefundsNeedingAction([])).toBe(0);
  });
});

describe("refundCancelBlocker", () => {
  it("hủy được khi đang chờ người/ví và cổng chưa nhận lệnh", () => {
    expect(refundCancelBlocker({ status: "AWAITING_FUNDS" })).toBeNull();
    expect(refundCancelBlocker({ status: "MANUAL_REVIEW", providerRefundId: null })).toBeNull();
  });

  it("trạng thái khác thì không hủy được", () => {
    for (const status of ["REQUESTED", "PROCESSING", "SUCCEEDED", "FAILED"]) {
      expect(refundCancelBlocker({ status })).toBe("status");
    }
  });

  it("cổng đã nhận lệnh chi thì không hủy được, kể cả trạng thái hợp lệ", () => {
    expect(refundCancelBlocker({ status: "MANUAL_REVIEW", providerRefundId: "payos-1" })).toBe("provider");
  });
});
