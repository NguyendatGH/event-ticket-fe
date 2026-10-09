import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CityInput, Field, FormRootError, FormSection, PasswordField, SubmitButton } from "@/components/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRegisterOrganizer } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { applyApiErrors, toPayload } from "@/lib/forms";
import { riseSm } from "@/lib/motion";
import { organizerRegisterSchema } from "./schemas";
import { AUTH_STAGGER, AuthFooter, AuthHeading } from "./components";

const DEFAULTS = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  organizerName: "",
  organizerDescription: "",
  contactPhone: "",
  website: "",
  city: "",
  agree: false,
};

const BECOME_FROM = { from: "/become-organizer" };

export default function OrganizerRegisterPage() {
  useDocumentTitle("Đăng ký ban tổ chức");
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(organizerRegisterSchema), defaultValues: DEFAULTS });
  const registerOrganizer = useRegisterOrganizer();

  const onSubmit = (values) => {
    const { confirmPassword, agree, ...body } = values;
    registerOrganizer.mutate(toPayload(body), {
      onSuccess: () => {
        toast.success("Đã tạo tài khoản ban tổ chức");
        navigate("/organizer", { replace: true });
      },
      onError: (err) => applyApiErrors(form, err, { codeFields: { EMAIL_ALREADY_USED: "email" } }),
    });
  };

  return (
    <motion.div variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10">
      <AuthHeading
        eyebrow="Dành cho nhà tổ chức"
        title="Đăng ký ban tổ chức"
        description="Tạo tài khoản và hồ sơ ban tổ chức cùng lúc. Sau đó bạn có thể tạo sự kiện và mở bán ngay."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-10">
          <FormSection title="Tài khoản" description="Dùng để đăng nhập và nhận thông báo đơn hàng.">
            <Field control={form.control} name="fullName" label="Họ và tên" autoComplete="name" placeholder="Trần Quốc Bảo" />
            <Field control={form.control} name="email" label="Email" type="email" autoComplete="email" inputMode="email" placeholder="ban@email.com" />
            <PasswordField control={form.control} name="password" label="Mật khẩu" strength />
            <PasswordField control={form.control} name="confirmPassword" label="Nhập lại mật khẩu" />
          </FormSection>

          <FormSection title="Ban tổ chức" description="Hiển thị trên trang sự kiện và trang ban tổ chức công khai.">
            <Field control={form.control} name="organizerName" label="Tên ban tổ chức" autoComplete="organization" placeholder="Sunrise Live" />
            <Field
              control={form.control}
              name="organizerDescription"
              label="Mô tả"
              optional
              render={(field) => <Textarea {...field} rows={3} placeholder="Bạn tổ chức những sự kiện gì, ở đâu" />}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field control={form.control} name="contactPhone" label="SĐT liên hệ" optional type="tel" autoComplete="tel" inputMode="tel" placeholder="0912 345 678" />
              <Field control={form.control} name="city" label="Thành phố" optional render={(field) => <CityInput {...field} />} />
            </div>
            <Field control={form.control} name="website" label="Website" optional type="url" inputMode="url" placeholder="https://" />
          </FormSection>

          <motion.div variants={riseSm} className="space-y-6 border-t border-border pt-8">
            <FormField
              control={form.control}
              name="agree"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} onBlur={field.onBlur} ref={field.ref} className="mt-0.5" />
                    </FormControl>
                    <FormLabel className="text-sm leading-relaxed font-normal text-secondary-foreground">
                      Tôi đồng ý với điều khoản dành cho nhà tổ chức và chịu trách nhiệm về thông tin sự kiện đăng bán.
                    </FormLabel>
                  </div>
                  <FormMessage className="text-meta" />
                </FormItem>
              )}
            />

            <FormRootError form={form} />

            <SubmitButton pending={registerOrganizer.isPending} pendingLabel="Đang tạo tài khoản" size="lg" className="w-full">
              Tạo tài khoản ban tổ chức
            </SubmitButton>
          </motion.div>
        </form>
      </Form>

      <AuthFooter prompt="Đã có tài khoản mua vé?" to="/auth/login" state={BECOME_FROM}>
        Đăng nhập để nâng cấp
      </AuthFooter>
    </motion.div>
  );
}
