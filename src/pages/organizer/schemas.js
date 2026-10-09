import { v, z } from "@/lib/forms";

export const organizerProfileSchema = z.object({
  name: v.required("Tên ban tổ chức", 200),
  description: v.text(5000, "Giới thiệu"),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  website: v.url("Website"),
  city: v.text(100, "Thành phố"),
  contactEmail: v.optionalEmail("Email liên hệ"),
  contactPhone: v.phone("Số điện thoại"),
});

export const toProfileForm = (p) => ({
  name: p?.name ?? "",
  description: p?.description ?? "",
  logoUrl: p?.logoUrl ?? null,
  coverUrl: p?.coverUrl ?? null,
  website: p?.website ?? "",
  city: p?.city ?? "",
  contactEmail: p?.contactEmail ?? "",
  contactPhone: p?.contactPhone ?? "",
});

