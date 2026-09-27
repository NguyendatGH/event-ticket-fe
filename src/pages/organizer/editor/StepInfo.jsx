import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/site";
import { CATEGORIES } from "@/lib/constants";
import { OrgField, NativeSelect } from "../components/OrgUi";
import { OrgFormSection } from "../components/OrgFormSection";
import { textToParagraphs } from "../lib/helpers";

/**
 * Bước 1 của trình sửa sự kiện: tên, danh mục, mô tả (nhiều đoạn), ảnh bìa.
 * Đọc/ghi field qua useFormContext (form nằm ở EditorForm). disabled = sự kiện đã hủy, chỉ xem.
 */
export function StepInfo({ disabled }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  // useWatch (không phải watch()): chỉ bước này render lại, không kéo theo cả wizard.
  const paragraphs = useWatch({ name: "description", compute: (d) => textToParagraphs(d).length });
  const category = useWatch({ name: "category" });

  return (
    <div>
      <OrgFormSection title="Cơ bản" description="Tên và danh mục giúp khách tìm thấy sự kiện của bạn.">
        <OrgField label="Tên sự kiện" htmlFor="ev-name" error={errors.name?.message}>
          {(a) => <Input id="ev-name" autoComplete="off" placeholder="Ví dụ: Đêm nhạc Mùa thu" disabled={disabled} {...a} {...register("name")} />}
        </OrgField>
        <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <OrgField label="Danh mục" htmlFor="ev-category" error={errors.category?.message}>
            {(a) => (
              <NativeSelect id="ev-category" placeholder={!category} disabled={disabled} {...a} {...register("category")}>
                <option value="">Chọn danh mục</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug} className="text-foreground">
                    {c.label}
                  </option>
                ))}
              </NativeSelect>
            )}
          </OrgField>
          <OrgField label="Mô tả ngắn" htmlFor="ev-tagline" optional hint="Một câu hiển thị ngay dưới tên sự kiện." error={errors.tagline?.message}>
            {(a) => <Input id="ev-tagline" placeholder="Hành trình âm nhạc bùng nổ giữa lòng Hà Nội" disabled={disabled} {...a} {...register("tagline")} />}
          </OrgField>
        </div>
      </OrgFormSection>

      <OrgFormSection title="Giới thiệu" description="Nội dung chính trên trang sự kiện. Viết rõ ai biểu diễn, trải nghiệm gì, cần lưu ý gì.">
        <OrgField
          label="Nội dung"
          htmlFor="ev-description"
          hint={`Mỗi đoạn cách nhau một dòng trống.${paragraphs ? ` Hiện có ${paragraphs} đoạn.` : ""}`}
          error={errors.description?.message}
        >
          {(a) => <Textarea id="ev-description" rows={9} className="min-h-52" disabled={disabled} {...a} {...register("description")} />}
        </OrgField>
      </OrgFormSection>

      <OrgFormSection title="Ảnh bìa" description="Ảnh ngang 16:9, tối thiểu 1600px chiều rộng để hiển thị sắc nét.">
        <OrgField label="Ảnh" htmlFor="ev-cover" error={errors.coverImageUrl?.message}>
          <Controller
            name="coverImageUrl"
            control={control}
            render={({ field }) => (
              <ImageUpload
                id="ev-cover"
                folder="events"
                aspect="16/9"
                value={field.value}
                onChange={(url) => field.onChange(url)}
                invalid={Boolean(errors.coverImageUrl)}
                disabled={disabled}
                label="Tải ảnh bìa"
              />
            )}
          />
        </OrgField>
        <OrgField label="Mô tả ảnh" htmlFor="ev-cover-alt" optional hint="Dành cho người dùng trình đọc màn hình." error={errors.coverImageAlt?.message}>
          {(a) => <Input id="ev-cover-alt" placeholder="Sân khấu ngoài trời với ánh đèn xanh" disabled={disabled} {...a} {...register("coverImageAlt")} />}
        </OrgField>
      </OrgFormSection>
    </div>
  );
}
