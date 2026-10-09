import { client } from "../client";

const enc = encodeURIComponent;
const base = "/admin/gateway";

export const organizers = () => client.get(`${base}/organizers`);
export const provision = (organizerId) => client.post(`${base}/organizers/${enc(organizerId)}/provision`);
export const merchants = () => client.get(`${base}/merchants`);
export const merchant = (merNo) => client.get(`${base}/merchants/${enc(merNo)}`);
export const updateMerchant = ({ merNo, ...body }) => client.patch(`${base}/merchants/${enc(merNo)}`, body);
export const rotateCredential = (merNo) => client.post(`${base}/merchants/${enc(merNo)}/credentials/rotate`);

export const terminals = (merNo) => client.get(`${base}/merchants/${enc(merNo)}/terminals`);
export const createTerminal = ({ merNo, activate, ...body }) =>
  client.post(`${base}/merchants/${enc(merNo)}/terminals`, body, { params: { activate } });
export const terminal = (terminalId) => client.get(`${base}/terminals/${enc(terminalId)}`);
export const setTerminalStatus = ({ terminalId, status }) =>
  client.patch(`${base}/terminals/${enc(terminalId)}`, { status });
export const setDefaultTerminal = ({ merNo, terminalId }) =>
  client.put(`${base}/merchants/${enc(merNo)}/default-terminal`, { terminalId });
export const configureTerminal = ({ terminalId, paymentMethods, threeDsPolicy, routingProfileCode, acquirerCode }) =>
  client.put(`${base}/terminals/${enc(terminalId)}/configuration`, { paymentMethods, threeDsPolicy, routingProfileCode, acquirerCode });

export const acquirerConfigs = (merNo) => client.get(`${base}/merchants/${enc(merNo)}/acquirer-configs`);
export const addAcquirerConfig = ({ merNo, ...body }) => client.post(`${base}/merchants/${enc(merNo)}/acquirer-configs`, body);
export const routingProfiles = () => client.get(`${base}/routing-profiles`);
export const routingProfile = (code) => client.get(`${base}/routing-profiles/${enc(code)}`);
export const createRoutingProfile = (body) => client.post(`${base}/routing-profiles`, body);
export const addRoutingRule = ({ code, ...body }) => client.post(`${base}/routing-profiles/${enc(code)}/rules`, body);
export const acquirers = () => client.get(`${base}/acquirers`);
export const createAcquirer = (body) => client.post(`${base}/acquirers`, body);
export const updateAcquirer = ({ code, ...body }) => client.patch(`${base}/acquirers/${enc(code)}`, body);
