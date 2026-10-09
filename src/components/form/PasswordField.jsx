import { memo, useState } from "react";
import { useWatch } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Field } from "./Field";

const VisibilityToggle = memo(function VisibilityToggle({ visible, setVisible }) {
  const Icon = visible ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={() => setVisible((s) => !s)}
      aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      aria-pressed={visible}
      className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-ring"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={visible ? "off" : "on"}
          className="col-start-1 row-start-1"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: DUR.fast }}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
});

function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-11", className)} />
      <VisibilityToggle visible={visible} setVisible={setVisible} />
    </div>
  );
}

const STRENGTH = [
  { label: "Quá ngắn", tone: "bg-destructive" },
  { label: "Yếu", tone: "bg-destructive" },
  { label: "Tạm được", tone: "bg-warning" },
  { label: "Khá mạnh", tone: "bg-primary" },
  { label: "Mạnh", tone: "bg-primary" },
];

function passwordScore(value) {
  if (!value) return null;
  if (value.length < 8) return 0;
  const extras = [value.length >= 12, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)];
  return Math.min(4, 1 + extras.filter(Boolean).length);
}

function PasswordStrength({ control, name }) {
  const score = useWatch({ control, name, compute: passwordScore });
  if (score === null) return null;
  const { label, tone } = STRENGTH[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="h-0.5 overflow-hidden bg-border">
            <span
              className={cn("block h-full origin-left transition-transform duration-300 ease-out-expo", tone, i <= Math.max(score, 1) ? "scale-x-100" : "scale-x-0")}
            />
          </span>
        ))}
      </div>
      <span className="w-16 text-right text-caption text-muted-foreground">{label}</span>
    </div>
  );
}

export function PasswordField({ strength = false, autoComplete = "new-password", autoFocus, ...props }) {
  return (
    <Field
      description={strength ? "Tối thiểu 8 ký tự." : undefined}
      below={strength ? <PasswordStrength control={props.control} name={props.name} /> : undefined}
      {...props}
      render={(field) => <PasswordInput {...field} autoComplete={autoComplete} autoFocus={autoFocus} />}
    />
  );
}
