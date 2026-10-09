// Gateway Admin Portal gọi qua Encore BE (role ADMIN); BE mới gắn X-Admin-Key xuống gateway.
// client đã có baseURL /api/v1 nên path ở đây là tương đối.
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
// activate = Encore thu tiền qua terminal này ngay. Response có usedByEncore: binding có đang trỏ vào terminal mới không.
export const createTerminal = ({ merNo, activate, ...body }) =>
  client.post(`${base}/merchants/${enc(merNo)}/terminals`, body, { params: { activate } });
export const terminal = (terminalId) => client.get(`${base}/terminals/${enc(terminalId)}`);
export const setTerminalStatus = ({ terminalId, status }) =>
  client.patch(`${base}/terminals/${enc(terminalId)}`, { status });
export const setActiveTerminal = ({ merNo, terminalId }) =>
  client.put(`${base}/merchants/${enc(merNo)}/active-terminal`, { terminalId });
// Methods + 3DS + routing gửi CÙNG LÚC: gateway kiểm trên trạng thái cuối. Gửi rời từng phần thì phụ thuộc
// thứ tự (thêm QR + đổi profile: lưu methods trước bị kiểm theo profile cũ và bị từ chối).
export const configureTerminal = ({ terminalId, paymentMethods, threeDsPolicy, routingProfileCode, acquirerCode }) =>
  client.put(`${base}/terminals/${enc(terminalId)}/configuration`, { paymentMethods, threeDsPolicy, routingProfileCode, acquirerCode });

export const acquirerConfigs = (merNo) => client.get(`${base}/merchants/${enc(merNo)}/acquirer-configs`);
export const addAcquirerConfig = ({ merNo, ...body }) => client.post(`${base}/merchants/${enc(merNo)}/acquirer-configs`, body);
export const routingProfiles = () => client.get(`${base}/routing-profiles`);
export const routingProfile = (code) => client.get(`${base}/routing-profiles/${enc(code)}`);
export const createRoutingProfile = (body) => client.post(`${base}/routing-profiles`, body);
export const addRoutingRule = ({ code, ...body }) => client.post(`${base}/routing-profiles/${enc(code)}/rules`, body);
export const acquirers = () => client.get(`${base}/acquirers`);
// Acquirer là DỮ LIỆU: mã, method nhận được, có 3DS hay không. Thêm acquirer không cần sửa code gateway.
export const createAcquirer = (body) => client.post(`${base}/acquirers`, body);
export const updateAcquirer = ({ code, ...body }) => client.patch(`${base}/acquirers/${enc(code)}`, body);
