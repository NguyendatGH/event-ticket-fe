/**
 * Trang hồ sơ ban tổ chức — route /organizer/profile
 * Form sửa tên, giới thiệu, logo/ảnh bìa, liên hệ; bên phải là bản xem trước trang công khai (ProfilePreview).
 * Dữ liệu: useMyOrganizerProfile (GET /organizer/profile), useUpdateOrganizerProfile (PUT /organizer/profile).
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, ImageUpload } from "@/components/site";
import { useMyOrganizerProfile, useUpdateOrganizerProfile } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CITIES } from "@/lib/constants";
import { applyApiErrors, toPayload } from "@/lib/forms";
import { OrgFormSection } from "./components/OrgFormSection";
import { OrgField, OrgHeader } from "./components/OrgUi";
import { ProfilePreview } from "./components/ProfilePreview";
import { organizerProfileSchema, toProfileForm } from "./lib/profile";

export default function OrganizerProfilePage() {
  useDocumentTitle("Hồ sơ ban tổ chức");
  const query = useMyOrganizerProfile();
  if (query.isPending) return <ProfileSkeleton />;
  if (query.isError) {
    // 404 = tài khoản organizer chưa có hồ sơ: thử lại cũng vô ích nên ẩn nút.
    const noProfile = query.error?.status === 404;
    return (
      <ErrorState
        error={query.error}
        onRetry={noProfile ? undefined : query.refetch}
        title={noProfile ? "Tài khoản chưa có hồ sơ ban tổ chức" : undefined}
      />
    );
  }
  return <ProfileForm profile={query.data} />;
}

function ProfileForm({ profile }) {
  const defaultValues = useMemo(() => toProfileForm(profile), [profile]);
  const form = useForm({ resolver: zodResolver(organizerProfileSchema), defaultValues, mode: "onTouched" });
  const {
    register,
    control,
    formState: { errors, isDirty },
  } = form;
  const update = useUpdateOrganizerProfile();

  const onSubmit = form.handleSubmit((vals) =>
    update.mutate(toPayload(vals), {
      onSuccess: (saved) => {
        form.reset(toProfileForm(saved));
        toast.success("Đã lưu hồ sơ ban tổ chức");
      },
      onError: (err) => {
        applyApiErrors(form, err);
        toast.error(err.message);
      },
    })
  );

  return (
    <div>
      <OrgHeader
        eyebrow="Hồ sơ"
        title="Hồ sơ ban tổ chức"
        meta="Thông tin hiển thị trên trang ban tổ chức và trong mỗi sự kiện của bạn."
        actions={
          profile.slug ? (
            <Button asChild variant="ghost" className="max-md:-ml-4">
              <Link to={`/organizers/${profile.slug}`}>
                Xem trang công khai
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-14">
        <form noValidate onSubmit={onSubmit} className="min-w-0">
          <OrgFormSection title="Thông tin" description="Tên và phần giới thiệu khách thấy đầu tiên.">
            <OrgField label="Tên ban tổ chức" htmlFor="org-name" error={errors.name?.message}>
              {(a) => <Input id="org-name" autoComplete="organization" {...a} {...register("name")} />}
            </OrgField>
            <OrgField label="Thành phố" htmlFor="org-city" optional error={errors.city?.message}>
              {(a) => <Input id="org-city" list="org-city-options" className="sm:max-w-60" {...a} {...register("city")} />}
            </OrgField>
            <datalist id="org-city-options">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <OrgField label="Giới thiệu" htmlFor="org-description" optional hint="Loại sự kiện bạn tổ chức, dấu ấn, địa điểm quen thuộc." error={errors.description?.message}>
              {(a) => <Textarea id="org-description" rows={6} className="min-h-40" {...a} {...register("description")} />}
            </OrgField>
          </OrgFormSection>

          <OrgFormSection title="Hình ảnh" description="Logo vuông và ảnh bìa ngang 3:1.">
            <div className="grid gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
              <OrgField label="Logo" htmlFor="org-logo" className="max-w-40">
                <Controller
                  name="logoUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload id="org-logo" folder="organizers" aspect="1/1" value={field.value} onChange={field.onChange} label="Tải logo" hint="Tối đa 5MB" />
                  )}
                />
              </OrgField>
              <OrgField label="Ảnh bìa" htmlFor="org-cover">
                <Controller
                  name="coverUrl"
                  control={control}
                  render={({ field }) => <ImageUpload id="org-cover" folder="organizers" aspect="3/1" value={field.value} onChange={field.onChange} label="Tải ảnh bìa" />}
                />
              </OrgField>
            </div>
          </OrgFormSection>

          <OrgFormSection title="Liên hệ" description="Khách và đối tác dùng để liên hệ với bạn.">
            <OrgField label="Website" htmlFor="org-website" optional error={errors.website?.message}>
              {(a) => <Input id="org-website" type="url" inputMode="url" placeholder="https://" {...a} {...register("website")} />}
            </OrgField>
            <div className="grid gap-6 sm:grid-cols-2">
              <OrgField label="Email liên hệ" htmlFor="org-email" optional error={errors.contactEmail?.message}>
                {(a) => <Input id="org-email" type="email" autoComplete="email" {...a} {...register("contactEmail")} />}
              </OrgField>
              <OrgField label="Số điện thoại" htmlFor="org-phone" optional error={errors.contactPhone?.message}>
                {(a) => <Input id="org-phone" type="tel" autoComplete="tel" {...a} {...register("contactPhone")} />}
              </OrgField>
            </div>
          </OrgFormSection>

          {errors.root?.server ? (
            <p role="alert" className="mb-4 border-l-2 border-destructive pl-4 text-sm text-destructive">
              {errors.root.server.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button type="submit" disabled={update.isPending || !isDirty}>
              {update.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Lưu hồ sơ
            </Button>
            {isDirty ? (
              <Button type="button" variant="ghost" onClick={() => form.reset(defaultValues)} disabled={update.isPending}>
                Hoàn tác
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">Không có thay đổi</span>
            )}
          </div>
        </form>

        <aside aria-label="Xem trước trang ban tổ chức" className="min-w-0">
          <div className="xl:sticky xl:top-24">
            <p className="eyebrow mb-3">Xem trước</p>
            <ProfilePreview control={control} profile={profile} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Đang tải hồ sơ">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-9 w-72" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-10 grid gap-12 border-t border-border pt-10 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-8 md:grid-cols-[180px_1fr]">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-60" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
        <Skeleton className="aspect-card w-full rounded-none" />
      </div>
    </div>
  );
}
