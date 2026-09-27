import { useQuery } from "@tanstack/react-query";
import * as configApi from "../services/config";
import { qk } from "./keys";
import { RESALE_CUTOFF_HOURS, RESALE_MIN_PRICE, SERVICE_FEE } from "@/lib/business";

/** Giá trị dùng tạm khi /config chưa về hoặc lỗi mạng (khớp mặc định application.yaml của BE). */
const FALLBACK = {
  checkoutFee: SERVICE_FEE,
  resaleMinPrice: RESALE_MIN_PRICE,
  resaleMaxMarkupPercent: 20,
  resaleCutoffHours: RESALE_CUTOFF_HOURS,
};

/**
 * Cấu hình nghiệp vụ từ BE (phí dịch vụ, luật giá bán lại). Luôn trả object đủ field, không cần kiểm tra loading:
 *   const { checkoutFee, resaleMinPrice } = useAppConfig();
 * Cấu hình chỉ đổi khi khởi động lại BE nên cache suốt phiên (staleTime Infinity).
 */
export function useAppConfig() {
  const { data } = useQuery({ queryKey: qk.config, queryFn: configApi.get, staleTime: Infinity });
  return data ? { ...FALLBACK, ...data } : FALLBACK;
}
