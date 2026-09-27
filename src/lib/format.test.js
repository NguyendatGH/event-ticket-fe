import { describe, expect, it } from "vitest";
import {
  addDaysISO,
  formatCompactVND,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatDayMonth,
  formatPercentChange,
  formatRelative,
  formatTime,
  formatTimeRange,
  formatVND,
  initials,
  todayISODate,
} from "./format";

// 12:00Z = 19:00 giờ VN (UTC+7), bất kể múi giờ máy chạy test.
const START = "2026-10-24T12:00:00Z";
const END = "2026-10-24T15:30:00Z";

describe("format", () => {
  it("tiền VND", () => {
    expect(formatVND(1500000)).toBe("1.500.000đ");
    expect(formatVND(0)).toBe("0đ");
    expect(formatVND(null)).toBe("");
    expect(formatCompactVND(428_500_000)).toBe("428,5 tr");
    expect(formatCompactVND(1_250_000_000)).toBe("1,25 tỷ");
    expect(formatPercentChange(12.44)).toBe("+12,4%");
    expect(formatPercentChange(-3)).toBe("-3%");
    expect(formatPercentChange(null)).toBe("");
  });

  it("ngày giờ theo giờ Việt Nam", () => {
    expect(formatDate(START)).toBe("24.10.2026");
    expect(formatDayMonth(START)).toBe("24.10");
    expect(formatTime(START)).toBe("19:00");
    expect(formatDateTime(START)).toBe("24.10.2026 19:00");
    expect(formatDateLong(START)).toBe("Thứ bảy, 24.10.2026");
    // 18:00Z ngày 24 = 01:00 ngày 25 giờ VN
    expect(formatDate("2026-10-24T18:00:00Z")).toBe("25.10.2026");
  });

  it("ngày không giờ (YYYY-MM-DD) không bị lệch múi giờ", () => {
    expect(formatDate("2026-09-01")).toBe("01.09.2026");
    expect(formatDateLong("2026-09-06")).toBe("Chủ nhật, 06.09.2026");
    expect(addDaysISO("2026-02-27", 3)).toBe("2026-03-02");
    expect(todayISODate(new Date("2026-09-26T20:00:00Z"))).toBe("2026-09-27");
  });

  it("khoảng giờ dùng gạch nối thường", () => {
    expect(formatTimeRange(START, END)).toBe("19:00-22:30");
    expect(formatTimeRange(START, null)).toBe("19:00");
    expect(formatTimeRange(START, "2026-10-25T19:00:00Z")).toBe("24.10.2026 19:00 - 26.10.2026 02:00");
  });

  it("thời gian tương đối", () => {
    const now = Date.parse(START);
    expect(formatRelative(START, now)).toBe("vừa xong");
    expect(formatRelative(now - 5 * 60_000, now)).toBe("5 phút trước");
    expect(formatRelative(now + 3 * 24 * 3600_000, now)).toBe("sau 3 ngày nữa");
  });

  it("giá trị rỗng/không hợp lệ trả chuỗi rỗng", () => {
    expect(formatDate(null)).toBe("");
    expect(formatTime("not-a-date")).toBe("");
  });

  it("chữ viết tắt tên", () => {
    expect(initials("Nguyễn Minh Anh")).toBe("MA");
    expect(initials("")).toBe("?");
  });
});
