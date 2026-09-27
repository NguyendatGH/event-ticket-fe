import { describe, expect, it } from "vitest";
import {
  draftSchema,
  emptyForm,
  emptyTier,
  publishChecklist,
  stepOfField,
  toForm,
  toRequest,
  validateForPublish,
} from "./schema";
import { normalizeServerField } from "./serverErrors";

const issuesOf = (values) => {
  const res = draftSchema.safeParse(values);
  return res.success ? [] : res.error.issues.map((i) => i.path.join("."));
};

const complete = () => ({
  ...emptyForm(),
  name: "Đêm nhạc Mùa thu",
  category: "music",
  tagline: "",
  description: "Đoạn một.\n\nĐoạn hai.",
  coverImageUrl: "/uploads/events/a.jpg",
  startsAt: "2099-11-14T19:30",
  endsAt: "2099-11-14T22:00",
  venue: { name: "Nhà hát Lớn", city: "Hà Nội", address: "" },
  schedule: [{ time: "17:00", title: "Mở cổng" }],
  tiers: [{ ...emptyTier(), name: "VIP", price: "1.500.000", totalQuantity: "200", maxPerOrder: "4" }],
});

describe("draftSchema (lưu nháp)", () => {
  it("chỉ cần tên; dòng hạng vé trống bị bỏ qua", () => {
    const values = { ...emptyForm(), name: "Đêm nhạc Mùa thu" };
    expect(issuesOf(values)).toEqual([]);
    const body = toRequest(values);
    expect(body.name).toBe("Đêm nhạc Mùa thu");
    expect(body.tiers).toEqual([]);
    expect(body.venue).toBeNull();
    expect(body.startsAt).toBeNull();
  });

  it("thiếu tên → lỗi ở name", () => {
    expect(issuesOf(emptyForm())).toContain("name");
  });

  it("hạng vé đã nhập phải hợp lệ, lỗi giữ đúng chỉ số dòng", () => {
    const values = {
      ...emptyForm(),
      name: "A",
      tiers: [emptyTier(), { ...emptyTier(), name: "VIP", price: "abc", totalQuantity: "10", maxPerOrder: "40" }],
    };
    const paths = issuesOf(values);
    expect(paths).toContain("tiers.1.price");
    expect(paths).toContain("tiers.1.maxPerOrder");
    expect(paths.some((p) => p.startsWith("tiers.0"))).toBe(false);
  });

  it("kết thúc trước bắt đầu → lỗi endsAt", () => {
    expect(issuesOf({ ...complete(), endsAt: "2099-11-14T18:00" })).toContain("endsAt");
  });

  it("không cho giảm số lượng dưới đã bán + đang giữ", () => {
    const values = complete();
    values.tiers[0] = { ...values.tiers[0], id: "t-1", sold: 150, reserved: 20, totalQuantity: "160" };
    expect(issuesOf(values)).toContain("tiers.0.totalQuantity");
  });
});

describe("publish", () => {
  it("bản nháp chỉ có tên → liệt kê mọi mục còn thiếu", () => {
    const paths = validateForPublish({ ...emptyForm(), name: "A" }).map((i) => i.path);
    expect(paths).toEqual(expect.arrayContaining(["category", "description", "coverImageUrl", "startsAt", "venue.name", "tiers.root"]));
  });

  it("đủ thông tin → xuất bản được", () => {
    expect(validateForPublish(complete())).toEqual([]);
    expect(publishChecklist(complete()).every((i) => i.ok)).toBe(true);
  });

  it("bắt đầu trong quá khứ → chặn", () => {
    const paths = validateForPublish({ ...complete(), startsAt: "2020-01-01T10:00", endsAt: "" }).map((i) => i.path);
    expect(paths).toContain("startsAt");
  });
});

describe("chuyển đổi DTO", () => {
  it("toRequest: giờ VN → ISO UTC, giá có dấu chấm → số, đoạn văn → mảng", () => {
    const body = toRequest(complete());
    expect(body.startsAt).toBe("2099-11-14T12:30:00.000Z");
    expect(body.description).toEqual(["Đoạn một.", "Đoạn hai."]);
    expect(body.tiers[0]).toEqual({ id: null, name: "VIP", description: null, price: 1500000, totalQuantity: 200, maxPerOrder: 4 });
    expect(body.venue).toEqual({ name: "Nhà hát Lớn", city: "Hà Nội", address: null });
  });

  it("toForm ⇄ toRequest giữ nguyên dữ liệu", () => {
    const detail = {
      id: "e1",
      name: "X",
      category: "music",
      description: ["a", "b"],
      startsAt: "2026-10-24T12:00:00Z",
      endsAt: null,
      venue: { name: "V", city: "Hà Nội", address: null },
      schedule: [],
      tiers: [{ id: "t1", name: "GA", description: null, price: 800000, totalQuantity: 100, maxPerOrder: 4, sold: 3, reserved: 1 }],
    };
    const form = toForm(detail);
    expect(form.startsAt).toBe("2026-10-24T19:00");
    expect(form.tiers[0].sold).toBe(3);
    const body = toRequest(form);
    expect(body.startsAt).toBe("2026-10-24T12:00:00.000Z");
    expect(body.tiers[0]).toMatchObject({ id: "t1", price: 800000, totalQuantity: 100 });
  });

  it("lỗi BE: path → field form và bước", () => {
    expect(normalizeServerField("tiers[0].price")).toBe("tiers.0.price");
    expect(normalizeServerField("description[1]")).toBe("description");
    expect(normalizeServerField("tiers")).toBe("tiers.root");
    expect(stepOfField("tiers.0.price")).toBe(2);
    expect(stepOfField("venue.city")).toBe(1);
    expect(stepOfField("coverImageUrl")).toBe(0);
  });
});
