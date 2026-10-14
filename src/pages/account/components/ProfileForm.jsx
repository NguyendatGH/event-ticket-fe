import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Field, FormRootError, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Container, ImageUpload } from "@/components/site";
import { useUpdateProfile } from "@/api";
import { applyApiErrors, toPayload } from "@/lib/forms";
import { DUR, EASE_IN, EASE_OUT } from "@/lib/motion";
import { profileDefaults, userProfileSchema } from "../schemas";

function BioCount({ control }) {
  const length = useWatch({ control, name: "bio", compute: (bio) => (bio || "").length });
  return `${length}/500 ký tự`;
}

export function ProfileForm({ user }) {
  const form = useForm({ resolver: zodResolver(userProfileSchema), defaultValues: profileDefaults(user) });
  const update = useUpdateProfile();
  const { isDirty } = form.formState;

  useEffect(() => {
    if (!form.formState.isDirty) form.reset(profileDefaults(user));
  }, [user, form]);

  const onSubmit = (values) =>
    update.mutate(toPayload(values), {
      onSuccess: (saved) => {
        form.reset(profileDefaults(saved));
        toast.success("Đã lưu thông tin cá nhân");
      },
      onError: (err) => applyApiErrors(form, err),
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
        <div className="grid gap-8 md:grid-cols-[160px_minmax(0,1fr)] md:gap-10">
          <div className="grid content-start gap-2">
            <Label htmlFor="avatar-upload">Ảnh đại diện</Label>
            <Controller
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <ImageUpload
                  id="avatar-upload"
                  folder="avatars"
                  aspect="1/1"
                  label="Tải ảnh"
                  hint="Tối đa 5MB"
                  value={field.value}
                  onChange={field.onChange}
                  className="w-36 md:w-40"
                />
              )}
            />
          </div>

          <div className="min-w-0 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field control={form.control} name="fullName" label="Họ và tên" autoComplete="name" />
              <Field control={form.control} name="phone" label="Số điện thoại" optional type="tel" autoComplete="tel" inputMode="tel" placeholder="0912 345 678" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={user?.email ?? ""} readOnly disabled aria-describedby="profile-email-hint" />
              <p id="profile-email-hint" className="text-caption text-muted-foreground">
                Email dùng để đăng nhập và nhận vé, không đổi được.
              </p>
            </div>

            <Field
              control={form.control}
              name="bio"
              label="Giới thiệu"
              optional
              description={<BioCount control={form.control} />}
              render={(field) => <Textarea {...field} rows={4} maxLength={500} placeholder="Vài dòng về bạn" />}
            />
          </div>
        </div>

        <FormRootError form={form} />

        <AnimatePresence>
          {isDirty || update.isPending ? (
            <motion.div
              key="save-bar"
              role="region"
              aria-label="Lưu thay đổi hồ sơ"
              initial={{ y: "100%" }}
              animate={{ y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } }}
              exit={{ y: "100%", transition: { duration: DUR.base, ease: EASE_IN } }}
              className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
            >
              <Container className="flex items-center justify-between gap-4 py-3">
                <p className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                  <span className="sm:hidden">Chưa lưu</span>
                  <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={() => form.reset(profileDefaults(user))} disabled={update.isPending}>
                    Hủy
                  </Button>
                  <SubmitButton pending={update.isPending} pendingLabel="Đang lưu">
                    Lưu thay đổi
                  </SubmitButton>
                </div>
              </Container>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>
    </Form>
  );
}
