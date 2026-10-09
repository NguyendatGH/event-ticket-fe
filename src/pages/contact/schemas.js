import { z, v } from "@/lib/forms";

export const contactSchema = z.object({
  name: v.required("Họ tên", 200),
  email: v.email(),
  subject: v.text(200, "Chủ đề"),
  message: z
    .string({ error: "Nội dung là bắt buộc" })
    .trim()
    .min(1, { error: "Nội dung là bắt buộc" })
    .min(10, { error: "Nội dung tối thiểu 10 ký tự" })
    .max(5000, { error: "Nội dung tối đa 5000 ký tự" }),
});

export const CONTACT_TOPICS = [
  "Vé và đơn hàng",
  "Dành cho ban tổ chức",
  "Góp ý khác",
];
