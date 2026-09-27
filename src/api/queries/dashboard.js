import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as dashboardApi from "../services/dashboard";
import { cleanParams } from "../params";
import { qk } from "./keys";

/** params chung: { from, to, interval, eventId } (YYYY-MM-DD, day|week|month) */
const dashQuery = (keyFn, fn) => (params = {}, options) => {
  const clean = cleanParams(params);
  return useQuery({ queryKey: keyFn(clean), queryFn: () => fn(clean), placeholderData: keepPreviousData, ...options });
};

/** GET /organizer/dashboard/summary */
export const useDashboardSummary = dashQuery(qk.organizer.dashboard.summary, dashboardApi.summary);
/** GET /organizer/dashboard/sales */
export const useDashboardSales = dashQuery(qk.organizer.dashboard.sales, dashboardApi.sales);
/** GET /organizer/dashboard/revenue */
export const useDashboardRevenue = dashQuery(qk.organizer.dashboard.revenue, dashboardApi.revenue);
/** GET /organizer/dashboard/top-events ({ ...params, limit }) */
export const useDashboardTopEvents = dashQuery(qk.organizer.dashboard.topEvents, dashboardApi.topEvents);
