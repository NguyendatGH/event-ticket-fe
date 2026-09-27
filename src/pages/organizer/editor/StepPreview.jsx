import { useWatch } from "react-hook-form";
import { Check, Circle } from "lucide-react";
import { ImageWithFallback, KeyValueList, Price } from "@/components/site";
import { categoryLabel } from "@/lib/constants";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { motion } from "motion/react";
import { Meter } from "@/components/motion";
import { cn } from "@/lib/utils";
import { localInputToIso, textToParagraphs } from "../lib/helpers";
import { readInt } from "./schema";

/** Checklist xuất bản: mỗi mục bấm được để nhảy tới đúng bước/field. */
export function PublishChecklist({ items, onJump, className }) {
  const done = items.filter((i) => i.ok).length;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between pb-3">
        <h2 className="heading-caps">Sẵn sàng xuất bản</h2>
        <span className={cn("text-sm tabular-nums", done === items.length ? "text-primary" : "text-muted-foreground")}>
          {done}/{items.length}
        </span>
      </div>
      <Meter value={done / items.length} className="h-0.75" />
      <ul>
        {items.map((item) => (
          <li key={item.key} className="border-b border-border">
            <button
              type="button"
              onClick={() => onJump?.(item)}
              className="group flex w-full cursor-pointer items-start gap-3 py-2.5 text-left text-sm focus-ring"
            >
              {item.ok ? (
                <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-0.5 shrink-0">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                </motion.span>
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-disabled-foreground" aria-hidden="true" />
              )}
              <span className="min-w-0">
                <span className={cn("block transition-colors", item.ok ? "text-secondary-foreground" : "text-foreground group-hover:text-primary")}>{item.label}</span>
                {!item.ok ? <span className="block text-xs text-muted-foreground">{item.message}</span> : null}
              </span>
              <span className="sr-only">{item.ok ? "Đã xong" : "Chưa xong"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Xem trước gần với trang sự kiện công khai (ảnh lớn, cột trái nội dung, cột phải hạng vé). */
function EventPreview({ values }) {
  const start = localInputToIso(values.startsAt);
  const end = localInputToIso(values.endsAt);
  const paragraphs = textToParagraphs(values.description);
  const venue = [values.venue?.name, values.venue?.city].filter((s) => String(s || "").trim()).join(", ");
  const tiers = (values.tiers || []).filter((t) => String(t.name || "").trim());

  return (
    <article className="border border-border bg-background-2" aria-label="Bản xem trước trang sự kiện">
      <ImageWithFallback
        src={values.coverImageUrl}
        alt={values.coverImageAlt || values.name || ""}
        fallback={null}
        fallbackLabel={values.name || "Sự kiện"}
        className="aspect-21/9 w-full"
      />
      <div className="grid gap-10 p-5 md:p-8 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          {values.category ? <p className="eyebrow text-primary">{categoryLabel(values.category)}</p> : null}
          <h2 className="mt-3 text-h2 text-balance text-foreground">{values.name || "Sự kiện chưa đặt tên"}</h2>
          {values.tagline ? <p className="mt-3 text-body-lg text-secondary-foreground">{values.tagline}</p> : null}

          <KeyValueList
            className="mt-8"
            labelWidth="sm:grid-cols-[120px_1fr]"
            items={[
              { label: "Ngày", value: start ? formatDateLong(start) : "Chưa chọn" },
              { label: "Giờ", value: start ? formatTimeRange(start, end) : "Chưa chọn" },
              { label: "Địa điểm", value: venue || "Chưa nhập" },
              { label: "Địa chỉ", value: values.venue?.address },
            ]}
          />

          <section className="mt-10">
            <h3 className="eyebrow">Giới thiệu</h3>
            <div className="mt-4 max-w-[65ch] space-y-4 text-ui leading-relaxed text-secondary-foreground">
              {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p className="text-disabled-foreground">Chưa có nội dung giới thiệu.</p>}
            </div>
          </section>

          {values.schedule?.length ? (
            <section className="mt-10">
              <h3 className="eyebrow">Lịch trình</h3>
              <ol className="mt-4 border-t border-border">
                {values.schedule.map((s, i) => (
                  <li key={i} className="grid grid-cols-[72px_1fr] gap-4 border-b border-border py-3 text-sm">
                    <span className="text-muted-foreground tabular-nums">{s.time}</span>
                    <span className="text-foreground">{s.title}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0">
          <h3 className="heading-caps">Chọn hạng vé</h3>
          <ul className="mt-4 border-t border-border">
            {tiers.length ? (
              tiers.map((t, i) => (
                <li key={i} className="flex items-start justify-between gap-4 border-b border-border py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{t.name}</p>
                    {t.description ? <p className="mt-1 text-meta text-muted-foreground">{t.description}</p> : null}
                  </div>
                  <Price value={readInt(t.price) ?? 0} className="shrink-0" />
                </li>
              ))
            ) : (
              <li className="border-b border-border py-4 text-sm text-disabled-foreground">Chưa có hạng vé.</li>
            )}
          </ul>
        </aside>
      </div>
    </article>
  );
}

export function StepPreview({ checklist, onJump }) {
  const values = useWatch();
  return (
    <div className="space-y-10">
      <EventPreview values={values} />
      <PublishChecklist items={checklist} onJump={onJump} className="xl:hidden" />
    </div>
  );
}
