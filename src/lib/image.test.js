import { describe, expect, it } from "vitest";
import { imageAt } from "./image";

describe("imageAt", () => {
  it("đặt lại w/q cho ảnh Unsplash, giữ tham số khác", () => {
    const out = new URL(imageAt("https://images.unsplash.com/photo-1?auto=format&fit=crop&w=1600&q=80", 600));
    expect(out.searchParams.get("w")).toBe("600");
    expect(out.searchParams.get("q")).toBe("75");
    expect(out.searchParams.get("fit")).toBe("crop");
    expect(out.pathname).toBe("/photo-1");
  });

  it("URL khác hoặc rỗng giữ nguyên", () => {
    expect(imageAt("/uploads/events/a.jpg", 600)).toBe("/uploads/events/a.jpg");
    expect(imageAt(null, 600)).toBe(null);
    expect(imageAt("https://images.unsplash.com/photo-1", 0)).toBe("https://images.unsplash.com/photo-1");
  });
});
