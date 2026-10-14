import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as dashboardApi from "../services/dashboard";
import { cleanParams } from "../params";
import { qk } from "./keys";

const dashQuery = (keyFn, fn) => (params = {}, options) => {
  const clean = cleanParams(params);
  return useQuery({ queryKey: keyFn(clean), queryFn: () => fn(clean), placeholderData: keepPreviousData, ...options });
};

export const useDashboardSummary = dashQuery(qk.organizer.dashboard.summary, dashboardApi.summary);
export const useDashboardSales = dashQuery(qk.organizer.dashboard.sales, dashboardApi.sales);
export const useDashboardRevenue = dashQuery(qk.organizer.dashboard.revenue, dashboardApi.revenue);
export const useDashboardTopEvents = dashQuery(qk.organizer.dashboard.topEvents, dashboardApi.topEvents);
