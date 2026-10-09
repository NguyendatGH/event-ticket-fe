import { useEffect } from "react";
import { BRAND } from "@/lib/constants";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : BRAND.name;
  }, [title]);
}
