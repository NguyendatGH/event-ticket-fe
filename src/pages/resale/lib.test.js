import { describe, expect, it } from "vitest";
import { describeHistory, formatDiff, notResellableReason, parseMoneyInput, priceDiffPct, priceSchema, priceRangeLabel } from "./lib";

describe("resale lib", () => {
  it("tính chênh lệch %", () => {
    expect(priceDiffPct(1250000, 1500000)).toBe(-16.7);
    expect(formatDiff(-16.7)).toBe("-16,7%");
    expect(formatDiff(0)).toBe("Bằng giá gốc");
    expect(priceDiffPct(1, 0)).toBeNull();
  });

  it("đọc ô nhập tiền", () => {
    expect(parseMoneyInput("1.250.000đ")).toBe(1250000);
    expect(parseMoneyInput("")).toBeNull();
  });

  it("schema giá: min 10.000, max giá trần", () => {
    const s = priceSchema(1800000);
    expect(s.safeParse({ price: 9000 }).error.issues[0].message).toBe("Giá bán tối thiểu 10.000đ");
    expect(s.safeParse({ price: 2000000 }).error.issues[0].message).toContain("1.800.000đ");
    expect(s.safeParse({ price: null }).error.issues[0].message).toBe("Nhập giá bán");
    expect(s.safeParse({ price: 1200000 }).success).toBe(true);
  });

  it("giải thích vé không bán lại được", () => {
    const now = Date.parse("2026-10-01T00:00:00Z");
    const base = { resellable: false, listing: null, status: "ACTIVE", price: 100000, event: { startsAt: "2026-10-01T01:00:00Z" } };
    expect(notResellableReason(base, { now }).title).toBe("Sự kiện sắp diễn ra");
    expect(notResellableReason({ ...base, status: "REFUNDED" }, { now }).title).toBe("Vé không còn hiệu lực");
    expect(notResellableReason({ ...base, event: { startsAt: "2026-09-01T00:00:00Z" } }, { now }).title).toBe("Sự kiện đã diễn ra");
    expect(notResellableReason({ ...base, resellable: true }, { now })).toBeNull();
  });

  it("mô tả lịch sử + nhãn khoảng giá", () => {
    expect(describeHistory({ type: "RESOLD", price: 1250000, from: { displayName: "Nguyen A." }, to: { displayName: "Tran B." } })).toBe(
      "Nguyen A. chuyển nhượng cho Tran B., giá 1.250.000đ"
    );
    expect(priceRangeLabel("", "500000")).toBe("Dưới 500.000đ");
    expect(priceRangeLabel("300000", "")).toBe("Từ 300.000đ");
  });
});
