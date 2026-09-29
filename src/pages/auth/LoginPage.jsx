// Đăng nhập, route "/auth/login" → useLogin (POST /auth/login, lưu token vào store).
// Dữ liệu: useLogin.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Field, FormRootError, PasswordField, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { useLogin } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { applyApiErrors } from "@/lib/forms";
import { riseSm } from "@/lib/motion";
import { afterLoginPath, loginSchema } from "./schemas";
import { AUTH_STAGGER, AuthFooter, AuthHeading, GoogleAuthButton } from "./components";

export default function LoginPage() {
  useDocumentTitle("Đăng nhập");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const login = useLogin();

  const onSubmit = (values) =>
    login.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (auth) => navigate(afterLoginPath(from, auth.user), { replace: true }),
        onError: (err) => {
          applyApiErrors(form, err);
          if (err.code === "BAD_CREDENTIALS") form.setValue("password", "");
        },
      }
    );

  return (
    <motion.div variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10">
      <AuthHeading
        title="Đăng nhập"
        description={from ? "Đăng nhập để tiếp tục nơi bạn đang dở." : "Xem vé và theo dõi đơn hàng của bạn."}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
          <Field control={form.control} name="email" label="Email" type="email" autoComplete="email" inputMode="email" placeholder="ban@email.com" autoFocus />
          <div className="space-y-2">
            <PasswordField control={form.control} name="password" label="Mật khẩu" autoComplete="current-password" />
            <motion.div variants={riseSm} className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-meta link-quiet">
                Quên mật khẩu?
              </Link>
            </motion.div>
          </div>

          <FormRootError form={form} />

          <motion.div variants={riseSm}>
            <SubmitButton pending={login.isPending} pendingLabel="Đang đăng nhập" size="lg" className="w-full">
              Đăng nhập
            </SubmitButton>
          </motion.div>
        </form>
      </Form>

      <GoogleAuthButton text="signin_with" onSuccess={(auth) => navigate(afterLoginPath(from, auth.user), { replace: true })} />

      <AuthFooter prompt="Bạn tổ chức sự kiện?" to="/auth/register-organizer">
        Đăng ký ban tổ chức
      </AuthFooter>
    </motion.div>
  );
}
