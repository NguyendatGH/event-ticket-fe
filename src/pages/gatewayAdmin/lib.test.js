import { describe, expect, it } from "vitest";
import { acquirerUsage, routeChain } from "./lib";

const acquirers = [
  { code: "bank-a", status: "ACTIVE", paymentMethods: ["CARD", "GOOGLE_PAY"] },
  { code: "bank-b", status: "ACTIVE", paymentMethods: ["CARD"] },
  { code: "old", status: "INACTIVE", paymentMethods: ["CARD"] },
];

describe("acquirerUsage", () => {
  it("gom theo acquirer: profile nào, method nào", () => {
    const usage = acquirerUsage([
      { code: "STANDARD", routes: { CARD: [{ priority: 1, acquirerCode: "bank-a" }, { priority: 2, acquirerCode: "bank-b" }],
        GOOGLE_PAY: [{ priority: 1, acquirerCode: "bank-a" }] } },
      { code: "ONLY_B", routes: { CARD: [{ priority: 1, acquirerCode: "bank-b" }] } },
    ]);

    expect(usage["bank-a"]).toEqual([{ profile: "STANDARD", methods: ["CARD", "GOOGLE_PAY"] }]);
    expect(usage["bank-b"]).toEqual([
      { profile: "STANDARD", methods: ["CARD"] },
      { profile: "ONLY_B", methods: ["CARD"] },
    ]);
    expect(usage["chưa-dùng"]).toBeUndefined();
  });
});

describe("routeChain", () => {
  const routes = { CARD: [{ priority: 2, acquirerCode: "bank-b" }, { priority: 1, acquirerCode: "bank-a" }] };

  it("sắp theo ưu tiên và tính số ưu tiên kế tiếp", () => {
    const { chain, nextPriority, usable } = routeChain({ routes, method: "CARD", acquirers });
    expect(chain.map((c) => c.code)).toEqual(["bank-a", "bank-b"]);
    expect(nextPriority).toBe(3);
    expect(usable).toBe(true);
  });

  it("method chưa có rule: chuỗi rỗng, ưu tiên kế tiếp là 1, không dùng được", () => {
    expect(routeChain({ routes, method: "QR", acquirers })).toEqual({ chain: [], nextPriority: 1, usable: false });
  });

  it("báo acquirer tắt, không nhận method, hoặc không còn tồn tại", () => {
    const r = { GOOGLE_PAY: [
      { priority: 1, acquirerCode: "old" }, { priority: 2, acquirerCode: "bank-b" }, { priority: 3, acquirerCode: "ghost" },
    ] };
    const { chain, usable } = routeChain({ routes: r, method: "GOOGLE_PAY", acquirers });
    expect(chain.map((c) => c.problem)).toEqual(["inactive", "unsupported", "missing"]);
    expect(usable).toBe(false);
  });

  it("chưa tải xong danh sách acquirer thì chưa báo vấn đề", () => {
    expect(routeChain({ routes, method: "CARD", acquirers: undefined }).chain.every((c) => c.problem === null)).toBe(true);
  });
});
