import { describe, expect, it, vi } from "vitest";
import { applyApiErrors, toFormPath, toPayload, v, z } from "./forms";
import { ApiError } from "@/api/errors";

const fakeForm = () => ({ setError: vi.fn() });

describe("forms", () => {
  it("toFormPath đổi index Spring sang path react-hook-form", () => {
    expect(toFormPath("tiers[0].price")).toBe("tiers.0.price");
    expect(toFormPath("schedule[12].time")).toBe("schedule.12.time");
    expect(toFormPath("venue.city")).toBe("venue.city");
  });

  it("applyApiErrors gán lỗi field (path lồng) và focus lỗi đầu", () => {
    const form = fakeForm();
    const err = new ApiError({
      status: 400,
      code: "EVENT_INCOMPLETE",
      message: "Sự kiện chưa đủ thông tin",
      errors: [
        { field: "tiers[0].price", message: "Giá không hợp lệ" },
        { field: "venue.city", message: "Thiếu thành phố" },
      ],
    });
    expect(applyApiErrors(form, err)).toBe(2);
    expect(form.setError).toHaveBeenNthCalledWith(1, "tiers.0.price", { type: "server", message: "Giá không hợp lệ" }, { shouldFocus: true });
    expect(form.setError).toHaveBeenNthCalledWith(2, "venue.city", { type: "server", message: "Thiếu thành phố" }, { shouldFocus: false });
  });

  it("applyApiErrors không có lỗi field → root.server", () => {
    const form = fakeForm();
    expect(applyApiErrors(form, new ApiError({ status: 409, message: "Email đã được sử dụng" }))).toBe(0);
    expect(form.setError).toHaveBeenCalledWith("root.server", { type: "server", message: "Email đã được sử dụng" });

    const silent = fakeForm();
    applyApiErrors(silent, new ApiError({ status: 500 }), { root: false });
    expect(silent.setError).not.toHaveBeenCalled();
  });

  it("applyApiErrors: mã lỗi trong codeFields → gán vào field đó", () => {
    const form = fakeForm();
    const err = new ApiError({ status: 409, code: "EMAIL_ALREADY_USED", message: "Email đã được sử dụng" });
    expect(applyApiErrors(form, err, { codeFields: { EMAIL_ALREADY_USED: "email" } })).toBe(1);
    expect(form.setError).toHaveBeenCalledWith("email", { type: "server", message: "Email đã được sử dụng" }, { shouldFocus: true });
    expect(form.setError).toHaveBeenCalledTimes(1);
  });

  it("schema helper có thông điệp tiếng Việt", () => {
    const schema = z.object({ email: v.email(), password: v.password(), phone: v.phone(), website: v.url("Website") });
    const r = schema.safeParse({ email: "x", password: "123", phone: "", website: "abc" });
    const msgs = Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
    expect(msgs).toEqual({
      email: "Email không hợp lệ",
      password: "Mật khẩu tối thiểu 8 ký tự",
      website: "Website phải bắt đầu bằng http:// hoặc https://",
    });
    expect(schema.safeParse({ email: " a@example.com ", password: "password123", phone: "0912 345 678", website: "" }).success).toBe(true);
    expect(v.required("Tên").safeParse("   ").error.issues[0].message).toBe("Tên là bắt buộc");
  });

  it("toPayload đổi chuỗi rỗng thành null (đệ quy)", () => {
    expect(toPayload({ name: "A", phone: "  ", venue: { city: "" }, tiers: [{ description: "" }], price: 0 })).toEqual({
      name: "A",
      phone: null,
      venue: { city: null },
      tiers: [{ description: null }],
      price: 0,
    });
  });
});
