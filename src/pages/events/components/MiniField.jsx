// Ô nhập nhỏ có nhãn chú thích phía trên.

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function MiniField({ label, className, ...props }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-caption text-muted-foreground">
        {label}
      </Label>
      <Input id={id} className={cn("h-9", className)} {...props} />
    </div>
  );
}
