import { cn } from "@/lib/utils";

/**
 * Đường răng cưa kiểu cuống vé: vạch đứt + hai khuyết tròn màu nền trang ở hai đầu. Trang trí (aria-hidden).
 * Thẻ cha phải `relative overflow-hidden` để khuyết tròn bị cắt còn nửa.
 *
 *   <Perforation />                        // ngang, đặt giữa hai phần của thẻ
 *   <Perforation orientation="vertical" /> // dọc, đặt trong một cột (cao bằng cột)
 */
export function Perforation({ orientation = "horizontal", className }) {
  const vertical = orientation === "vertical";
  return (
    <div aria-hidden="true" className={cn("relative", vertical ? "w-0 self-stretch" : "h-0", className)}>
      <span className={cn("absolute border-dashed border-white/14", vertical ? "inset-y-4 left-0 border-l-2" : "inset-x-4 top-0 border-t-2")} />
      <span className={cn("absolute size-6 rounded-full bg-page", vertical ? "-top-3 -left-3" : "-top-3 -left-3")} />
      <span className={cn("absolute size-6 rounded-full bg-page", vertical ? "-bottom-3 -left-3" : "-top-3 -right-3")} />
    </div>
  );
}
