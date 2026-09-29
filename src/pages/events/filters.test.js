// Test đọc/ghi bộ lọc của /events trên URL.

import { describe, expect, it } from "vitest";
import {
  activeChips,
  activeCount,
  applyPatch,
  clearFilters,
  readFilters,
} from "./filters";

const sp = (s) => new URLSearchParams(s);

describe("events filters", () => {
  it("đọc URL, bỏ giá trị sai và dùng sort mặc định", () => {
    const f = readFilters(
      sp(
        "q=%20jazz%20&when=yesterday&from=2026-10-01&priceMin=-5&priceMax=500000&sort=weird",
      ),
    );
    expect(f).toMatchObject({
      q: "jazz",
      when: "",
      from: "2026-10-01",
      priceMin: null,
      priceMax: 500000,
      sort: "date",
    });
  });

  it("when và from/to loại trừ nhau; sort mặc định không ghi lên URL", () => {
    const withRange = applyPatch(
      sp("from=2026-10-01&to=2026-10-05&sort=price"),
      { when: "weekend" },
    );
    expect(withRange.toString()).toBe("sort=price&when=weekend");
    expect(
      applyPatch(sp("when=today"), { from: "2026-10-01" }).toString(),
    ).toBe("from=2026-10-01");
    expect(applyPatch(sp("sort=price"), { sort: "date" }).has("sort")).toBe(
      false,
    );
  });

  it("giữ priceMax=0 (miễn phí) và xóa bộ lọc nhưng giữ sort", () => {
    expect(
      applyPatch(sp(""), { priceMin: null, priceMax: 0 }).get("priceMax"),
    ).toBe("0");
    expect(
      clearFilters(
        sp("category=music&city=H%C3%A0+N%E1%BB%99i&sort=-price"),
      ).toString(),
    ).toBe("sort=-price");
  });

  it("chip và đếm bộ lọc đang bật", () => {
    const f = readFilters(
      sp("category=music&city=TP.HCM&priceMin=500000&priceMax=1000000&q=lumi"),
    );
    expect(activeChips(f).map((c) => c.label)).toEqual([
      '"lumi"',
      "Âm nhạc",
      "TP.HCM",
      "500.000đ - 1.000.000đ",
    ]);
    expect(activeCount(f)).toBe(3);
  });
});
