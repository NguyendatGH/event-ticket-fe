// Test hằng số nghiệp vụ và tierLimit.

import { describe, expect, it } from "vitest";
import { tierLimit } from "./business";

describe("business", () => {
  it("tierLimit = min(maxPerOrder, available)", () => {
    expect(tierLimit({ maxPerOrder: 4, available: 12 })).toBe(4);
    expect(tierLimit({ maxPerOrder: 4, available: 2 })).toBe(2);
    expect(tierLimit({ maxPerOrder: 4, available: 0 })).toBe(0);
  });
});
