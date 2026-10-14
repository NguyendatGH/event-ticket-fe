import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CITIES } from "@/lib/constants";
import { formatDateLong, formatTime } from "@/lib/format";
import { OrgField } from "../components/OrgUi";
import { OrgFormSection } from "../components/OrgFormSection";
import { localInputToIso } from "../lib";

const readable = (local) => {
  const iso = localInputToIso(local);
  return iso ? `${formatDateLong(iso)}, ${formatTime(iso)}` : null;
};

export function StepTimeVenue({ disabled }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const schedule = useFieldArray({ control, name: "schedule" });
  const [startsAt, endsAt] = useWatch({ name: ["startsAt", "endsAt"] });

  return (
    <div>
      <OrgFormSection title="Thời gian" description="Nhập theo giờ Việt Nam (GMT+7). Sự kiện cần bắt đầu ở tương lai để xuất bản.">
        <div className="grid gap-6 sm:grid-cols-2">
          <OrgField label="Bắt đầu" htmlFor="ev-starts" hint={readable(startsAt)} error={errors.startsAt?.message}>
            {(a) => <Input id="ev-starts" type="datetime-local" className="tabular-nums" disabled={disabled} {...a} {...register("startsAt")} />}
          </OrgField>
          <OrgField label="Kết thúc" htmlFor="ev-ends" optional hint={readable(endsAt)} error={errors.endsAt?.message}>
            {(a) => <Input id="ev-ends" type="datetime-local" className="tabular-nums" disabled={disabled} {...a} {...register("endsAt")} />}
          </OrgField>
        </div>
      </OrgFormSection>

      <OrgFormSection title="Địa điểm" description="Tên địa điểm và thành phố hiển thị trên thẻ sự kiện và bộ lọc.">
        <OrgField label="Tên địa điểm" htmlFor="ev-venue-name" error={errors.venue?.name?.message}>
          {(a) => <Input id="ev-venue-name" placeholder="Sân vận động Quốc gia Mỹ Đình" disabled={disabled} {...a} {...register("venue.name")} />}
        </OrgField>
        <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <OrgField label="Thành phố" htmlFor="ev-venue-city" error={errors.venue?.city?.message}>
            {(a) => <Input id="ev-venue-city" list="ev-city-options" placeholder="Hà Nội" disabled={disabled} {...a} {...register("venue.city")} />}
          </OrgField>
          <datalist id="ev-city-options">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <OrgField label="Địa chỉ" htmlFor="ev-venue-address" optional error={errors.venue?.address?.message}>
            {(a) => <Input id="ev-venue-address" placeholder="Đường Lê Đức Thọ, Nam Từ Liêm" disabled={disabled} {...a} {...register("venue.address")} />}
          </OrgField>
        </div>
      </OrgFormSection>

      <OrgFormSection title="Lịch trình" description="Các mốc trong ngày diễn ra: mở cổng, tiết mục chính, kết thúc. Không bắt buộc.">
        {schedule.fields.length ? (
          <ol className="border-t border-border">
            {schedule.fields.map((row, i) => {
              const err = errors.schedule?.[i];
              return (
                <li key={row.id} className="grid grid-cols-[104px_minmax(0,1fr)_32px] items-start gap-3 border-b border-border py-3">
                  <div>
                    <label htmlFor={`sch-${i}-time`} className="sr-only">
                      Giờ mốc {i + 1}
                    </label>
                    <Input id={`sch-${i}-time`} type="time" className="tabular-nums" aria-invalid={Boolean(err?.time) || undefined} disabled={disabled} {...register(`schedule.${i}.time`)} />
                    {err?.time ? <p className="mt-1.5 text-xs text-destructive">{err.time.message}</p> : null}
                  </div>
                  <div>
                    <label htmlFor={`sch-${i}-title`} className="sr-only">
                      Nội dung mốc {i + 1}
                    </label>
                    <Input id={`sch-${i}-title`} placeholder="Mở cổng" aria-invalid={Boolean(err?.title) || undefined} disabled={disabled} {...register(`schedule.${i}.title`)} />
                    {err?.title ? <p className="mt-1.5 text-xs text-destructive">{err.title.message}</p> : null}
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" className="mt-1" aria-label={`Xóa mốc ${i + 1}`} onClick={() => schedule.remove(i)} disabled={disabled}>
                    <X aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="border-y border-border py-4 text-sm text-muted-foreground">Chưa có mốc nào. Ví dụ: 17:00 Mở cổng, 19:30 Biểu diễn chính.</p>
        )}
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={() => schedule.append({ time: "", title: "" })} disabled={disabled}>
            <Plus aria-hidden="true" />
            Thêm mốc
          </Button>
        </div>
      </OrgFormSection>
    </div>
  );
}
