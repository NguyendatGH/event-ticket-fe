import { z, v } from "@/lib/forms";
import { CATEGORY_LABEL } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { isoToLocalInput, localInputToIso, paragraphsToText, textToParagraphs } from "../lib";

export const STEPS = [
  { key: "info", label: "Thông tin sự kiện" },
  { key: "time", label: "Thời gian & địa điểm" },
  { key: "tiers", label: "Hạng vé" },
  { key: "preview", label: "Xem trước" },
];

const MAX_SAFE = 9_000_000_000_000;

const intText = (label, { min = 0, max = MAX_SAFE } = {}) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => String(val ?? "").replace(/[.\s,]/g, ""))
    .pipe(
      z
        .string()
        .min(1, { error: `Nhập ${label.toLowerCase()}` })
        .regex(/^\d+$/, { error: `${label} phải là số nguyên không âm` })
    )
    .transform(Number)
    .pipe(
      z
        .number()
        .min(min, { error: `${label} tối thiểu ${formatNumber(min)}` })
        .max(max, { error: `${label} tối đa ${formatNumber(max)}` })
    );

const isBlankTier = (t) =>
  !t?.id && ["name", "description", "price", "totalQuantity"].every((k) => String(t?.[k] ?? "").trim() === "");

export const readInt = (val) => {
  const s = String(val ?? "").replace(/[.\s,]/g, "");
  return /^\d+$/.test(s) ? Number(s) : null;
};

const tierSchema = z.object({
  id: z.string().nullable().optional(),
  name: v.required("Tên hạng vé", 200),
  description: v.text(500, "Mô tả hạng vé"),
  price: intText("Giá vé"),
  totalQuantity: intText("Số lượng"),
  maxPerOrder: intText("Tối đa mỗi đơn", { min: 1, max: 20 }),
  sold: z.number().optional(),
  reserved: z.number().optional(),
  originalPrice: z.number().nullable().optional(),
});

const scheduleSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Nhập giờ (HH:mm)" }),
  title: v.required("Nội dung", 200),
});

export const draftSchema = z
  .object({
    name: v.required("Tên sự kiện", 200),
    category: z.string().optional(),
    tagline: v.text(300, "Mô tả ngắn"),
    description: z.string().max(20_000, { error: "Giới thiệu quá dài" }).optional(),
    coverImageUrl: z.string().nullable().optional(),
    coverImageAlt: v.text(300, "Mô tả ảnh"),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    venue: z.object({
      name: v.text(200, "Tên địa điểm"),
      city: v.text(100, "Thành phố"),
      address: v.text(300, "Địa chỉ"),
    }),
    schedule: z.array(scheduleSchema),
    tiers: z.array(z.any()),
  })
  .superRefine((val, ctx) => {
    val.tiers = val.tiers.map((t, i) => {
      if (isBlankTier(t)) return t;
      const res = tierSchema.safeParse(t);
      if (res.success) return res.data;
      res.error.issues.forEach((issue) => ctx.addIssue({ ...issue, code: "custom", path: ["tiers", i, ...issue.path] }));
      return t;
    });
    const start = localInputToIso(val.startsAt);
    const end = localInputToIso(val.endsAt);
    if (start && end && end <= start) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Thời gian kết thúc phải sau thời gian bắt đầu" });
    }
    val.tiers.forEach((t, i) => {
      const locked = (t.sold ?? 0) + (t.reserved ?? 0);
      if (locked > 0 && typeof t.totalQuantity === "number" && t.totalQuantity < locked) {
        ctx.addIssue({
          code: "custom",
          path: ["tiers", i, "totalQuantity"],
          message: `Không thể thấp hơn ${formatNumber(locked)} vé đã bán và đang giữ`,
        });
      }
    });
  });

export function publishChecklist(values, now = Date.now()) {
  const start = localInputToIso(values.startsAt);
  const end = localInputToIso(values.endsAt);
  const all = values.tiers || [];
  const tiers = all.filter((t) => !isBlankTier(t));
  const badTier = all.findIndex((t) => !isBlankTier(t) && ((readInt(t.totalQuantity) ?? 0) < 1 || !String(t.name || "").trim()));
  const venueName = String(values.venue?.name || "").trim();
  const venueCity = String(values.venue?.city || "").trim();
  return [
    { key: "name", step: 0, path: "name", label: "Tên sự kiện", ok: Boolean(String(values.name || "").trim()), message: "Tên sự kiện là bắt buộc" },
    { key: "category", step: 0, path: "category", label: "Danh mục", ok: Boolean(CATEGORY_LABEL[values.category]), message: "Chọn danh mục" },
    { key: "description", step: 0, path: "description", label: "Phần giới thiệu", ok: textToParagraphs(values.description).length > 0, message: "Viết ít nhất một đoạn giới thiệu" },
    { key: "cover", step: 0, path: "coverImageUrl", label: "Ảnh bìa", ok: Boolean(values.coverImageUrl), message: "Tải ảnh bìa cho sự kiện" },
    {
      key: "startsAt",
      step: 1,
      path: "startsAt",
      label: "Thời gian bắt đầu",
      ok: Boolean(start) && new Date(start).getTime() > now,
      message: start ? "Thời gian bắt đầu phải ở tương lai" : "Chọn thời gian bắt đầu",
    },
    { key: "endsAt", step: 1, path: "endsAt", label: "Thời gian kết thúc", ok: !end || (start && end > start), message: "Thời gian kết thúc phải sau thời gian bắt đầu" },
    {
      key: "venue",
      step: 1,
      path: venueName ? "venue.city" : "venue.name",
      label: "Địa điểm và thành phố",
      ok: Boolean(venueName && venueCity),
      message: venueName ? "Nhập thành phố" : "Nhập tên địa điểm",
    },
    {
      key: "tiers",
      step: 2,
      path: tiers.length === 0 ? "tiers.root" : `tiers.${Math.max(badTier, 0)}.totalQuantity`,
      label: "Hạng vé",
      ok: tiers.length > 0 && badTier === -1,
      message: tiers.length === 0 ? "Thêm ít nhất một hạng vé" : "Mỗi hạng vé cần tên và số lượng từ 1",
    },
  ];
}

const publishSchema = draftSchema.superRefine((val, ctx) => {
  publishChecklist(val).forEach((item) => {
    if (!item.ok) ctx.addIssue({ code: "custom", path: item.path.split(".").map((s) => (/^\d+$/.test(s) ? Number(s) : s)), message: item.message });
  });
  if (!String(val.venue?.name || "").trim() && !String(val.venue?.city || "").trim()) {
    ctx.addIssue({ code: "custom", path: ["venue", "city"], message: "Nhập thành phố" });
  }
});

export function validateForPublish(values) {
  const res = publishSchema.safeParse(values);
  if (res.success) return [];
  const seen = new Set();
  return res.error.issues
    .map((i) => ({ path: i.path.join(".") === "tiers" ? "tiers.root" : i.path.join("."), message: i.message }))
    .filter((i) => (seen.has(i.path) ? false : seen.add(i.path)));
}

export const emptyTier = () => ({ id: null, name: "", description: "", price: "", totalQuantity: "", maxPerOrder: "4", sold: 0, reserved: 0, originalPrice: null });

export const emptyForm = () => ({
  name: "",
  category: "",
  tagline: "",
  description: "",
  coverImageUrl: null,
  coverImageAlt: "",
  startsAt: "",
  endsAt: "",
  venue: { name: "", city: "", address: "" },
  schedule: [],
  tiers: [emptyTier()],
});

export function toForm(detail) {
  if (!detail) return emptyForm();
  return {
    name: detail.name ?? "",
    category: detail.category ?? "",
    tagline: detail.tagline ?? "",
    description: paragraphsToText(detail.description),
    coverImageUrl: detail.coverImageUrl ?? null,
    coverImageAlt: detail.coverImageAlt ?? "",
    startsAt: isoToLocalInput(detail.startsAt),
    endsAt: isoToLocalInput(detail.endsAt),
    venue: { name: detail.venue?.name ?? "", city: detail.venue?.city ?? "", address: detail.venue?.address ?? "" },
    schedule: (detail.schedule || []).map((s) => ({ time: s.time ?? "", title: s.title ?? "" })),
    tiers: (detail.tiers || []).map((t) => ({
      id: t.id ?? null,
      name: t.name ?? "",
      description: t.description ?? "",
      price: t.price != null ? String(t.price) : "",
      totalQuantity: t.totalQuantity != null ? String(t.totalQuantity) : "",
      maxPerOrder: t.maxPerOrder != null ? String(t.maxPerOrder) : "4",
      sold: t.sold ?? 0,
      reserved: t.reserved ?? 0,
      originalPrice: t.price ?? null,
    })),
  };
}

const blank = (s) => {
  const t = String(s ?? "").trim();
  return t === "" ? null : t;
};

export function toRequest(values) {
  const venue = { name: blank(values.venue?.name), city: blank(values.venue?.city), address: blank(values.venue?.address) };
  return {
    name: String(values.name).trim(),
    category: blank(values.category),
    tagline: blank(values.tagline),
    description: textToParagraphs(values.description),
    coverImageUrl: blank(values.coverImageUrl),
    coverImageAlt: blank(values.coverImageAlt),
    startsAt: localInputToIso(values.startsAt),
    endsAt: localInputToIso(values.endsAt),
    venue: venue.name || venue.city || venue.address ? venue : null,
    schedule: (values.schedule || []).map((s) => ({ time: s.time, title: String(s.title).trim() })),
    tiers: (values.tiers || []).filter((t) => !isBlankTier(t)).map((t) => ({
      id: t.id || null,
      name: String(t.name).trim(),
      description: blank(t.description),
      price: readInt(t.price) ?? 0,
      totalQuantity: readInt(t.totalQuantity) ?? 0,
      maxPerOrder: readInt(t.maxPerOrder) ?? 1,
    })),
  };
}

export function stepOfField(path = "") {
  if (path.startsWith("tiers")) return 2;
  if (/^(startsAt|endsAt|venue|schedule)/.test(path)) return 1;
  return 0;
}

const FIELD_LABELS = {
  name: "Tên sự kiện",
  category: "Danh mục",
  tagline: "Mô tả ngắn",
  description: "Giới thiệu",
  coverImageUrl: "Ảnh bìa",
  coverImageAlt: "Mô tả ảnh",
  startsAt: "Bắt đầu",
  endsAt: "Kết thúc",
  "venue.name": "Địa điểm",
  "venue.city": "Thành phố",
  "venue.address": "Địa chỉ",
};

export function fieldLabel(path = "") {
  if (FIELD_LABELS[path]) return FIELD_LABELS[path];
  const tier = path.match(/^tiers\.(\d+)/);
  if (tier) return `Hạng vé ${Number(tier[1]) + 1}`;
  if (path.startsWith("tiers")) return "Hạng vé";
  const sched = path.match(/^schedule\.(\d+)/);
  if (sched) return `Lịch trình ${Number(sched[1]) + 1}`;
  return path;
}

export function errorPaths(errors, prefix = "") {
  if (!errors || typeof errors !== "object") return [];
  if (typeof errors.message === "string" && errors.type) return [prefix.replace(/\.$/, "")];
  return Object.entries(errors).flatMap(([k, val]) => (k === "ref" ? [] : errorPaths(val, `${prefix}${k}.`)));
}

