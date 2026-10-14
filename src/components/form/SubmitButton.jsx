import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({ pending, children, pendingLabel, className, ...props }) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending || undefined} className={className} {...props}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel || children : children}
    </Button>
  );
}
