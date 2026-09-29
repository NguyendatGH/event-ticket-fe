// Test cn() và tailwind-merge với token tự định nghĩa.

import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("giữ cỡ chữ tự định nghĩa cạnh màu chữ", () => {
    expect(cn("text-caption text-disabled-foreground")).toBe("text-caption text-disabled-foreground");
    expect(cn("text-h1 text-foreground", "text-h2")).toBe("text-foreground text-h2");
    expect(cn("text-sm", "text-muted-foreground")).toBe("text-sm text-muted-foreground");
    expect(cn("max-w-site", "max-w-3xl")).toBe("max-w-3xl");
    expect(cn("text-meta text-muted-foreground", "text-ui")).toBe("text-muted-foreground text-ui");
    expect(cn("tracking-caps", "tracking-label")).toBe("tracking-label");
    expect(cn("aspect-card", "aspect-video")).toBe("aspect-video");
  });
});
