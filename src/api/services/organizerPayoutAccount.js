import { client } from "../client";

// Cổng PayOS: BTC khai MỘT tài khoản nhận tiền (save).
// Cổng BankSim: BTC có nhiều KÊNH nhận tiền, mỗi kênh một ngân hàng của cổng + phương thức + tài khoản ở ngân hàng đó.
// Mọi lời gọi đều trả lại toàn bộ cấu hình nhận tiền (GET) để cache cập nhật một lần.
export const get = () => client.get("/organizer/payout-account");

export const save = (body) => client.put("/organizer/payout-account", body);

export const addChannel = (body) => client.post("/organizer/payout-account/channels", body);

export const updateChannel = ({ id, ...body }) => client.put(`/organizer/payout-account/channels/${id}`, body);

export const removeChannel = (id) => client.delete(`/organizer/payout-account/channels/${id}`);
