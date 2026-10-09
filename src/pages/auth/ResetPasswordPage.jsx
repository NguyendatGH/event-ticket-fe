import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { toast } from "sonner";
import { FormRootError, PasswordField, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useResetPassword } from "@/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { applyApiErrors } from "@/lib/forms";
import { riseSm } from "@/lib/motion";
import { resetSchema } from "./schemas";
import { AUTH_STAGGER, AuthHeading } from "./components";

const TOKEN_PROBLEMS = {
  MISSING: {
    title: "Thiếu liên kết đặt lại",
    description: "Trang này cần mở từ liên kết trong email đặt lại mật khẩu. Gửi yêu cầu mới để nhận liên kết.",
  },
  TOKEN_INVALID: {
    title: "Liên kết không hợp lệ",
    description: "Liên kết đã được dùng hoặc bị sao chép thiếu. Mỗi liên kết chỉ dùng được một lần. Gửi yêu cầu mới để nhận liên kết khác.",
  },
  TOKEN_EXPIRED: {
    title: "Liên kết đã hết hạn",
    description: "Liên kết đặt lại mật khẩu chỉ có hiệu lực 30 phút. Gửi yêu cầu mới để nhận liên kết khác.",
  },
};

function TokenProblem({ code }) {
  const p = TOKEN_PROBLEMS[code];
  return (
    <motion.div variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10" role="alert">
      <AuthHeading title={p.title} description={p.description} />
      <motion.div variants={riseSm} className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/auth/forgot-password">Gửi lại liên kết</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link to="/auth/login">Về đăng nhập</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  useDocumentTitle("Đặt lại mật khẩu");
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [problem, setProblem] = useState(token ? null : "MISSING");
  const form = useForm({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirmPassword: "" } });
  const reset = useResetPassword();

  if (problem) return <TokenProblem code={problem} />;

  const onSubmit = ({ password }) =>
    reset.mutate(
      { token, password },
      {
        onSuccess: () => {
          toast.success("Đã đổi mật khẩu. Đăng nhập bằng mật khẩu mới.");
          navigate("/auth/login", { replace: true });
        },
        onError: (err) => {
          if (err.code === "TOKEN_INVALID" || err.code === "TOKEN_EXPIRED") setProblem(err.code);
          else applyApiErrors(form, err);
        },
      }
    );

  return (
    <motion.div variants={AUTH_STAGGER} initial="hidden" animate="show" className="space-y-10">
      <AuthHeading title="Đặt mật khẩu mới" description="Sau khi đổi, mọi thiết bị đang đăng nhập sẽ phải đăng nhập lại." />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
          <PasswordField control={form.control} name="password" label="Mật khẩu mới" strength autoFocus />
          <PasswordField control={form.control} name="confirmPassword" label="Nhập lại mật khẩu mới" />
          <FormRootError form={form} />
          <motion.div variants={riseSm}>
            <SubmitButton pending={reset.isPending} pendingLabel="Đang cập nhật" size="lg" className="w-full">
              Đổi mật khẩu
            </SubmitButton>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
