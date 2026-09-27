import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner } from "sonner";

// App chỉ có giao diện tối nên không cần next-themes.
const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-info" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--elevated)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "4px"
        }
      }
      toastOptions={{
        duration: 4000,
        classNames: {
          // Mép trái màu theo loại toast thay cho glow.
          toast: "font-sans !shadow-none !rounded-md border-l-2 data-[type=success]:!border-l-primary data-[type=error]:!border-l-destructive",
          description: "!text-muted-foreground",
        },
      }}
      offset={24}
      {...props}
    />
  );
}

export { Toaster }
