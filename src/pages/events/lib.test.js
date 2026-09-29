// Test hàm thuần khu sự kiện.

import { describe, expect, it } from "vitest";
import { SERVICE_FEE } from "@/lib/business";
import { checkoutHref, purchaseState, summarize, toParagraphs } from "./lib";

describe("events lib", () => {
  it("purchaseState: chỉ PUBLISHED mới mua được", () => {
    expect(purchaseState("PUBLISHED")).toMatchObject({ open: true, cta: "Mua vé" });
    expect(purchaseState("SOLD_OUT")).toMatchObject({ open: false, cta: "Đã hết vé" });
    expect(purchaseState("DRAFT")).toEqual({ open: false, cta: "Chưa mở bán" });
  });

  it("summarize: bỏ hạng số lượng 0, cộng phí khi có vé", () => {
    const tiers = [
      { id: "a", name: "A", price: 100 },
      { id: "b", name: "B", price: 50 },
    ];
    expect(summarize(tiers, { a: 2, b: 0 })).toEqual({
      lines: [{ id: "a", name: "A", quantity: 2, amount: 200 }],
      count: 2,
      subtotal: 200,
      fee: SERVICE_FEE,
      total: 200 + SERVICE_FEE,
    });
    expect(summarize(tiers, {})).toMatchObject({ count: 0, fee: 0, total: 0 });
  });

  it("checkoutHref ghép tiers=<id>:<qty>", () => {
    expect(checkoutHref("show", [{ id: "a", quantity: 2 }, { id: "b", quantity: 1 }])).toBe("/checkout/show?tiers=a:2,b:1");
  });

  it("toParagraphs nhận mảng, chuỗi hoặc rỗng", () => {
    expect(toParagraphs(["x", "y"])).toEqual(["x", "y"]);
    expect(toParagraphs("x")).toEqual(["x"]);
    expect(toParagraphs("")).toEqual([]);
    expect(toParagraphs(null)).toEqual([]);
  });
});
