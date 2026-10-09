import { useQuery } from "@tanstack/react-query";
import * as paymentMethodsApi from "../services/paymentMethods";
import { qk } from "./keys";

export const usePublicPaymentMethods = (organizerId, options) =>
  useQuery({ queryKey: qk.organizer.paymentMethods(organizerId), queryFn: () => paymentMethodsApi.publicMethods(organizerId), enabled: Boolean(organizerId), ...options });
