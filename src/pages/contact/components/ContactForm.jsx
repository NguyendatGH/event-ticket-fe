import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSendContact } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { applyApiErrors, toPayload } from "@/lib/forms";
import { EASE_IN, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CONTACT_TOPICS, contactSchema } from "../schemas";

function SentMark() {
  const draw = (delay) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, ease: EASE_OUT, delay },
        opacity: { duration: 0.01, delay },
      },
    },
  });
  return (
    <svg
      viewBox="0 0 40 40"
      className="size-10 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.circle cx="20" cy="20" r="18" {...draw(0)} />
      <motion.path d="M12.5 20.5l5 5 10-11" {...draw(0.35)} />
    </svg>
  );
}

const swap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE_IN } },
};

function TopicChips({ value, onPick }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1" aria-label="Chủ đề gợi ý">
      {CONTACT_TOPICS.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={value === t}
          onClick={() => onPick(value === t ? "" : t)}
          className={cn(
            "cursor-pointer rounded-sm border px-2.5 py-1 text-meta transition-colors focus-ring",
            value === t
              ? "border-primary bg-primary/5 text-primary"
              : "text-muted-foreground hover:border-border-hover hover:text-foreground",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function ContactForm() {
  const { user } = useAuth();
  const [sentTo, setSentTo] = useState(null);
  const defaults = {
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    subject: "",
    message: "",
  };
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: defaults,
  });
  const send = useSendContact();

  const onSubmit = (values) =>
    send.mutate(toPayload(values), {
      onSuccess: () => {
        setSentTo(values.email);
        form.reset({ ...defaults, name: values.name, email: values.email });
      },
      onError: (err) => {
        const fieldCount = applyApiErrors(form, err, { root: false });
        if (fieldCount === 0) toast.error(err.message);
      },
    });

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sentTo ? (
        <motion.div
          key="sent"
          {...swap}
          role="status"
          className="border-t border-border pt-10"
        >
          <SentMark />
          <h3 className="mt-5 text-h3 text-foreground">Đã gửi tin nhắn</h3>
          <p className="mt-3 max-w-[52ch] text-secondary-foreground">
            Cảm ơn bạn. Chúng tôi sẽ trả lời qua{" "}
            <span className="text-foreground">{sentTo}</span> trong vòng một
            ngày làm việc.
          </p>
          <Button
            variant="secondary"
            className="mt-8"
            onClick={() => setSentTo(null)}
          >
            Gửi tin nhắn khác
          </Button>
        </motion.div>
      ) : (
        <motion.div key="form" {...swap}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="content-start">
                      <FormLabel>Họ tên</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="content-start">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="content-start">
                    <FormLabel>
                      Chủ đề{" "}
                      <span className="font-normal text-muted-foreground">
                        (không bắt buộc)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <TopicChips
                      value={field.value}
                      onPick={(t) =>
                        form.setValue("subject", t, { shouldValidate: true })
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="content-start">
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        className="min-h-40"
                        placeholder="Nếu hỏi về đơn hàng, ghi kèm mã đơn để chúng tôi tra nhanh hơn."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-caption text-muted-foreground">
                  Chúng tôi chỉ dùng email này để trả lời bạn.
                </p>
                <Button type="submit" size="lg" disabled={send.isPending}>
                  {send.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : null}
                  Gửi tin nhắn
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
