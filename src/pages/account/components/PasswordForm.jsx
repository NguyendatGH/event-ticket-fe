import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormRootError, PasswordField, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { useChangePassword } from "@/api";
import { applyApiErrors } from "@/lib/forms";
import { passwordSchema } from "../schemas";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

/** Đổi mật khẩu → PUT /users/me/password. WRONG_PASSWORD gắn vào ô mật khẩu hiện tại. */
export function PasswordForm() {
  const form = useForm({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY });
  const change = useChangePassword();

  const onSubmit = ({ currentPassword, newPassword }) =>
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          form.reset(EMPTY);
          toast.success("Đã đổi mật khẩu");
        },
        onError: (err) => applyApiErrors(form, err, { codeFields: { WRONG_PASSWORD: "currentPassword" } }),
      }
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-8">
        <PasswordField control={form.control} name="currentPassword" label="Mật khẩu hiện tại" autoComplete="current-password" />
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
          <PasswordField control={form.control} name="newPassword" label="Mật khẩu mới" strength />
          <PasswordField control={form.control} name="confirmPassword" label="Nhập lại mật khẩu mới" />
        </div>
        <FormRootError form={form} />
        <SubmitButton pending={change.isPending} pendingLabel="Đang cập nhật" variant="secondary">
          Đổi mật khẩu
        </SubmitButton>
      </form>
    </Form>
  );
}
