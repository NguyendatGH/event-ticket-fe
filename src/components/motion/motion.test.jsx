import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedItem, AnimatedList, AnimatedNumber, Meter, Reveal } from "@/components/motion";

describe("motion primitives", () => {
  it("AnimatedNumber render thẳng giá trị cuối trong test", () => {
    render(<AnimatedNumber value={26700000} format={(n) => `${n.toLocaleString("vi-VN")}đ`} />);
    expect(screen.getByText("26.700.000đ")).toBeInTheDocument();
  });

  it("Tabs: gạch chân nằm trong tab đang chọn và đi theo khi đổi tab", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">nội dung A</TabsContent>
        <TabsContent value="b">nội dung B</TabsContent>
      </Tabs>
    );
    const ind = (name) => screen.getByRole("tab", { name }).querySelector("span[aria-hidden]");
    expect(ind("A")).not.toBeNull();
    expect(ind("B")).toBeNull();
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(ind("B")).not.toBeNull();
    expect(screen.getByText("nội dung B")).toBeInTheDocument();
  });

  it("Meter, Reveal, AnimatedList render nội dung", () => {
    render(
      <>
        <Meter value={0.4} label="Đã bán" />
        <Reveal>khối</Reveal>
        <AnimatedList>
          <AnimatedItem key="x">dòng</AnimatedItem>
        </AnimatedList>
      </>
    );
    expect(screen.getByRole("meter", { name: "Đã bán" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("khối")).toBeInTheDocument();
    expect(screen.getByText("dòng")).toBeInTheDocument();
  });
});
