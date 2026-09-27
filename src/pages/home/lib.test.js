import { describe, expect, it } from "vitest";
import { byStartsAt, cheapestPerEvent, mergeEvents, sectionStatus } from "./lib";

describe("home lib", () => {
  it("mergeEvents gộp nhiều danh sách, bỏ trùng theo id, giữ thứ tự đầu tiên, bỏ qua undefined", () => {
    const a = { id: "a" };
    const b = { id: "b" };
    const c = { id: "c" };
    expect(mergeEvents([a, b], undefined, [b, c], [{ id: "a", name: "bản sau" }])).toEqual([a, b, c]);
    expect(mergeEvents()).toEqual([]);
  });

  it("byStartsAt sắp theo giờ bắt đầu, thiếu ngày xếp cuối, không đổi mảng gốc", () => {
    const list = [
      { id: 1, startsAt: "2026-11-02T12:00:00Z" },
      { id: 2 },
      { id: 3, startsAt: "2026-10-01T12:00:00Z" },
    ];
    expect(byStartsAt(list).map((e) => e.id)).toEqual([3, 1, 2]);
    expect(list.map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it("cheapestPerEvent giữ tin rẻ nhất mỗi sự kiện và đếm số tin còn lại", () => {
    const groups = cheapestPerEvent([
      { id: 1, price: 500, event: { id: "a" } },
      { id: 2, price: 300, event: { id: "a" } },
      { id: 3, price: 900, event: { id: "b" } },
    ]);
    expect(groups).toEqual([
      { listing: { id: 2, price: 300, event: { id: "a" } }, others: 1 },
      { listing: { id: 3, price: 900, event: { id: "b" } }, others: 0 },
    ]);
  });

  describe("sectionStatus", () => {
    const loading = { isPending: true, fetchStatus: "fetching", isError: false };
    const disabled = { isPending: true, fetchStatus: "idle", isError: false };
    const failed = { isPending: false, fetchStatus: "idle", isError: true };
    const done = { isPending: false, fetchStatus: "idle", isError: false };

    it("có mục để hiện → ready, kể cả khi query khác còn tải hoặc lỗi", () => {
      expect(sectionStatus([loading, done], 3)).toBe("ready");
      expect(sectionStatus([failed, done], 1)).toBe("ready");
    });
    it("chưa có mục, còn query đang tải → loading (query tắt không tính)", () => {
      expect(sectionStatus([loading], 0)).toBe("loading");
      expect(sectionStatus([done, disabled], 0)).toBe("empty");
    });
    it("mọi query lỗi → error; một phần lỗi, phần kia rỗng → empty", () => {
      expect(sectionStatus([failed], 0)).toBe("error");
      expect(sectionStatus([failed, failed], 0)).toBe("error");
      expect(sectionStatus([failed, done], 0)).toBe("empty");
    });
  });
});
