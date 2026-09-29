// Quên mật khẩu, route "/auth/forgot-password" → useForgotPassword (POST /auth/forgot-password).
// Dữ liệu: useForgotPassword.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, MailCheck } from "lucide-react";
import { Field, FormRootError, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BackLink } from "@/components/site";
import { useForgotPassword } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { applyApiErrors } from "@/lib/forms";
import { riseSm } from "@/lib/motion";
import { forgotSchema } from "./schemas";
import { AUTH_STAGGER, AuthHeading } from "./components";

const toInternal = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin ? `${u.pathname}${u.search}` : null;
  } catch {
    return null;
  }
};

export default function ForgotPasswordPage() {
  useDocumentTitle("Quên mật khẩu");
  const [sent, setSent] = useState(null);
  const form = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });
  const forgot = useForgotPassword();

  const onSubmit = ({ email }) =>
    forgot.mutate(
      { email },
      {
        onSuccess: (res) => setSent({ email, ...res }),
        onError: (err) => applyApiErrors(form, err),
      },
    );

  if (sent) {
    const internal = sent.devResetUrl ? toInternal(sent.devResetUrl) : null;
    return (
      <motion.div key="sent" variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10" role="status">
        <motion.div variants={riseSm} className="space-y-5">
          <MailCheck className="size-5.5 text-primary" aria-hidden="true" />
          <AuthHeading
            title="Kiểm tra hộp thư"
            description={
              <>
                Nếu <span className="text-foreground">{sent.email}</span> có tài khoản, chúng tôi đã gửi liên kết đặt lại mật khẩu. Liên kết có hiệu lực trong{" "}
                {sent.expiresInMinutes ?? 30} phút.
              </>
            }
          />
        </motion.div>

        {sent.devResetUrl ? (
          <motion.div variants={riseSm} className="space-y-2 border-l-2 border-info py-1 pl-4">
            <p className="eyebrow text-info">Môi trường dev</p>
            <p className="text-sm text-secondary-foreground">Không có email thật. Mở trực tiếp liên kết đặt lại:</p>
            {internal ? (
              <Link to={internal} className="inline-flex items-center gap-1 text-sm break-all link-accent">
                Đặt lại mật khẩu
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <a href={sent.devResetUrl} className="text-sm break-all link-accent">
                {sent.devResetUrl}
              </a>
            )}
          </motion.div>
        ) : null}

        <motion.div variants={riseSm} className="space-y-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">Không thấy email? Kiểm tra thư mục spam, hoặc gửi lại sau ít phút.</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth/login">Về đăng nhập</Link>
            </Button>
            <Button variant="secondary" onClick={() => setSent(null)}>
              Gửi lại
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div key="form" variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10">
      <AuthHeading title="Quên mật khẩu" description="Nhập email bạn dùng để đăng nhập. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu." />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
          <Field control={form.control} name="email" label="Email" type="email" autoComplete="email" inputMode="email" placeholder="ban@email.com" autoFocus />
          <FormRootError form={form} />
          <motion.div variants={riseSm}>
            <SubmitButton pending={forgot.isPending} pendingLabel="Đang gửi" size="lg" className="w-full">
              Gửi liên kết
            </SubmitButton>
          </motion.div>
        </form>
      </Form>
      <motion.div variants={riseSm} className="border-t border-border pt-6">
        <BackLink to="/auth/login">Quay lại đăng nhập</BackLink>
      </motion.div>
    </motion.div>
  );
}
