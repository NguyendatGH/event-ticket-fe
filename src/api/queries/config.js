// Hook GET /config (phí dịch vụ, Google client id, danh mục ngân hàng kèm cờ supported), cache suốt phiên.

import { useQuery } from "@tanstack/react-query";
import * as configApi from "../services/config";
import { qk } from "./keys";
import { SERVICE_FEE } from "@/lib/business";

const FALLBACK = {
  checkoutFee: SERVICE_FEE,
  googleClientId: null,
  banks: [],
};

export function useAppConfig() {
  const { data } = useQuery({ queryKey: qk.config, queryFn: configApi.get, staleTime: Infinity });
  return data ? { ...FALLBACK, ...data } : FALLBACK;
}
