import { describe, expect, it } from "vitest";
import { failureReason, orderOutcome, parseTiers, retryHref, serializeTiers } from "./lib";

describe("checkout lib", () => {
  it("parseTiers đọc tiers=id:qty, bỏ phần hỏng, cộng dồn id trùng", () => {
    expect(parseTiers("a:2,b:1,c:0,d:x,:3,a:1")).toEqual({ a: 3, b: 1 });
    expect(parseTiers(null)).toEqual({});
  });

  it("serializeTiers bỏ số lượng 0", () => {
    expect(serializeTiers({ a: 2, b: 0, c: 1 })).toBe("a:2,c:1");
  });

  it("orderOutcome phân loại kết quả sau cổng thanh toán", () => {
    expect(orderOutcome({ status: "PAID" })).toBe("success");
    expect(orderOutcome({ status: "EXPIRED" })).toBe("failed");
    expect(orderOutcome({ status: "PENDING_PAYMENT", payment: { status: "FAILED" } })).toBe("failed");
    expect(orderOutcome({ status: "MANUAL_REVIEW" })).toBe("review");
    expect(orderOutcome({ status: "PENDING_PAYMENT", payment: { status: "PENDING" } })).toBe("pending");
    expect(orderOutcome({ status: "REFUNDED" })).toBe("other");
  });

  it("failureReason ưu tiên URL, không có thì suy từ đơn", () => {
    expect(failureReason({ status: "CANCELLED" }, "declined")).toBe("declined");
    expect(failureReason({ status: "CANCELLED" })).toBe("cancelled");
    expect(failureReason({ status: "PENDING_PAYMENT", payment: { status: "EXPIRED" } })).toBe("timeout");
    expect(failureReason({ status: "PENDING_PAYMENT", payment: { status: "FAILED" } })).toBe("declined");
  });

  it("retryHref dựng lại giỏ cũ, đơn resale quay về tin bán", () => {
    const order = { kind: "PRIMARY", eventSlug: "lumiere", items: [{ tierId: "a", quantity: 2 }, { tierId: "b", quantity: 1 }] };
    expect(retryHref(order)).toBe("/checkout/lumiere?tiers=a:2,b:1");
    expect(retryHref({ kind: "RESALE", resaleListingId: "l1" })).toBe("/resale/l1");
  });
});
