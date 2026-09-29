// Tạo tài khoản khách, route "/auth/register" → useRegister (POST /auth/register, đăng nhập luôn).
// Dữ liệu: useRegister.

import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Field, FormRootError, PasswordField, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { useRegister } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { BRAND } from "@/lib/constants";
import { applyApiErrors } from "@/lib/forms";
import { riseSm } from "@/lib/motion";
import { registerSchema } from "./schemas";
import { AUTH_STAGGER, AuthFooter, AuthHeading, GoogleAuthButton } from "./components";

function EmailTakenHint({ control }) {
  const { errors } = useFormState({ control, name: "email" });
  if (errors.email?.type !== "server") return null;
  return (
    <p className="text-meta text-muted-foreground">
      Đây là email của bạn?{" "}
      <Link to="/auth/login" className="link-accent">
        Đăng nhập
      </Link>{" "}
      hoặc{" "}
      <Link to="/auth/forgot-password" className="link-accent">
        đặt lại mật khẩu
      </Link>
      .
    </p>
  );
}

export default function RegisterPage() {
  useDocumentTitle("Tạo tài khoản");
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });
  const register = useRegister();

  const onSubmit = ({ fullName, email, password }) =>
    register.mutate(
      { fullName, email, password },
      {
        onSuccess: (auth) => {
          toast.success(`Chào mừng ${auth.user?.fullName ?? ""} đến với ${BRAND.name}`.trim());
          navigate(location.state?.from || "/", { replace: true });
        },
        onError: (err) => applyApiErrors(form, err, { codeFields: { EMAIL_ALREADY_USED: "email" } }),
      }
    );

  return (
    <motion.div variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10">
      <AuthHeading title="Tạo tài khoản" description="Một tài khoản để mua vé và lưu vé điện tử." />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
          <Field control={form.control} name="fullName" label="Họ và tên" autoComplete="name" placeholder="Nguyễn Minh Anh" autoFocus />
          <div className="space-y-2">
            <Field control={form.control} name="email" label="Email" type="email" autoComplete="email" inputMode="email" placeholder="ban@email.com" />
            <EmailTakenHint control={form.control} />
          </div>
          <PasswordField control={form.control} name="password" label="Mật khẩu" strength />
          <PasswordField control={form.control} name="confirmPassword" label="Nhập lại mật khẩu" />

          <FormRootError form={form} />

          <motion.div variants={riseSm} className="space-y-4">
            <SubmitButton pending={register.isPending} pendingLabel="Đang tạo tài khoản" size="lg" className="w-full">
              Tạo tài khoản
            </SubmitButton>
            <p className="text-caption leading-relaxed text-muted-foreground">
              Khi tạo tài khoản, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của {BRAND.name}.
            </p>
          </motion.div>
        </form>
      </Form>

      <GoogleAuthButton
        text="signup_with"
        onSuccess={(auth) => {
          toast.success(`Chào mừng ${auth.user?.fullName ?? ""} đến với ${BRAND.name}`.trim());
          navigate(location.state?.from || "/", { replace: true });
        }}
      />

      <AuthFooter prompt="Bạn muốn bán vé cho sự kiện của mình?" to="/auth/register-organizer">
        Đăng ký ban tổ chức
      </AuthFooter>
    </motion.div>
  );
}
