import { useEffect } from "react";
import { BRAND } from "@/lib/constants";

/** Đặt <title>: "Tên trang | <BRAND.name>". Không truyền → chỉ tên thương hiệu. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : BRAND.name;
  }, [title]);
}
