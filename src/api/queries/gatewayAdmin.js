import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/gatewayAdmin";
import { qk } from "./keys";

export const useGatewayOrganizers = (options) =>
  useQuery({ queryKey: qk.gatewayAdmin.organizers, queryFn: api.organizers, ...options });

export const useGatewayMerchants = (options) =>
  useQuery({ queryKey: qk.gatewayAdmin.merchants, queryFn: api.merchants, ...options });

export const useGatewayMerchant = (merNo, options) =>
  useQuery({ queryKey: qk.gatewayAdmin.merchant(merNo), queryFn: () => api.merchant(merNo), enabled: Boolean(merNo), ...options });

export const useGatewayTerminals = (merNo, options) =>
  useQuery({ queryKey: qk.gatewayAdmin.terminals(merNo), queryFn: () => api.terminals(merNo), enabled: Boolean(merNo), ...options });

export const useGatewayTerminal = (terminalId, options) =>
  useQuery({ queryKey: qk.gatewayAdmin.terminal(terminalId), queryFn: () => api.terminal(terminalId), enabled: Boolean(terminalId), ...options });

export const useGatewayAcquirerConfigs = (merNo, options) =>
  useQuery({ queryKey: qk.gatewayAdmin.acquirerConfigs(merNo), queryFn: () => api.acquirerConfigs(merNo), enabled: Boolean(merNo), ...options });

export const useGatewayRoutingProfiles = (options) =>
  useQuery({ queryKey: qk.gatewayAdmin.routingProfiles, queryFn: api.routingProfiles, ...options });

export const useGatewayRoutingProfileDetails = (codes = []) =>
  useQueries({ queries: codes.map((code) => ({ queryKey: qk.gatewayAdmin.routingProfile(code), queryFn: () => api.routingProfile(code) })) });

export const useGatewayRoutingProfile = (code, options) =>
  useQuery({ queryKey: qk.gatewayAdmin.routingProfile(code), queryFn: () => api.routingProfile(code), enabled: Boolean(code), ...options });

export const useGatewayAcquirers = (options) =>
  useQuery({ queryKey: qk.gatewayAdmin.acquirers, queryFn: api.acquirers, ...options });

const invalidating = (keys) => (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    ...options,
    onSuccess: (data, vars, ctx) => {
      keys(vars).forEach((key) => qc.invalidateQueries({ queryKey: key }));
      options.onSuccess?.(data, vars, ctx);
    },
  });
};

export function useProvisionOrganizer(options = {}) {
  return invalidating(() => [qk.gatewayAdmin.organizers, qk.gatewayAdmin.merchants])({ mutationFn: api.provision, ...options });
}
export function useUpdateGatewayMerchant(options = {}) {
  return invalidating((v) => [qk.gatewayAdmin.merchants, qk.gatewayAdmin.merchant(v.merNo)])({ mutationFn: api.updateMerchant, ...options });
}
export function useRotateGatewayCredential(options = {}) {
  return invalidating((merNo) => [qk.gatewayAdmin.merchant(merNo)])({ mutationFn: api.rotateCredential, ...options });
}
export function useCreateGatewayTerminal(options = {}) {
  return invalidating(() => [qk.gatewayAdmin.merchants, qk.gatewayAdmin.organizers])({ mutationFn: api.createTerminal, ...options });
}
export function useSetTerminalStatus(options = {}) {
  return invalidating((v) => [qk.gatewayAdmin.terminals(v.merNo), qk.gatewayAdmin.terminal(v.terminalId)])({
    mutationFn: api.setTerminalStatus, ...options });
}
export function useSetDefaultTerminal(options = {}) {
  return invalidating((v) => [qk.gatewayAdmin.merchant(v.merNo), qk.gatewayAdmin.terminals(v.merNo)])({
    mutationFn: api.setDefaultTerminal, ...options });
}
export function useConfigureTerminal(options = {}) {
  return invalidating((v) => [qk.gatewayAdmin.terminal(v.terminalId)])({ mutationFn: api.configureTerminal, ...options });
}
export function useCreateRoutingProfile(options = {}) {
  return invalidating(() => [qk.gatewayAdmin.routingProfiles])({ mutationFn: api.createRoutingProfile, ...options });
}
export function useAddRoutingRule(options = {}) {
  return invalidating((v) => [qk.gatewayAdmin.routingProfiles, qk.gatewayAdmin.routingProfile(v.code)])({ mutationFn: api.addRoutingRule, ...options });
}
export function useAddGatewayAcquirerConfig(options = {}) {
  return invalidating((v) => [qk.gatewayAdmin.acquirerConfigs(v.merNo)])({ mutationFn: api.addAcquirerConfig, ...options });
}
export function useCreateGatewayAcquirer(options = {}) {
  return invalidating(() => [qk.gatewayAdmin.acquirers])({ mutationFn: api.createAcquirer, ...options });
}
export function useUpdateGatewayAcquirer(options = {}) {
  return invalidating(() => [qk.gatewayAdmin.acquirers])({ mutationFn: api.updateAcquirer, ...options });
}
