// Avatar vuông; không có ảnh thì hiện chữ viết tắt.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const SIZES = { sm: "size-7 text-2xs", md: "size-9 text-xs", lg: "size-14 text-base", xl: "size-24 text-2xl" };

export function UserAvatar({ user, name, src, size = "md", className, fallbackClassName }) {
  const label = name ?? user?.fullName ?? user?.displayName ?? user?.name ?? "";
  const image = src ?? user?.avatarUrl ?? user?.logoUrl;
  return (
    <Avatar className={cn("rounded-sm", SIZES[size], className)}>
      {image ? <AvatarImage src={image} alt={label} className="object-cover" /> : null}
      <AvatarFallback className={cn("rounded-sm bg-elevated font-medium text-secondary-foreground", fallbackClassName)}>{initials(label)}</AvatarFallback>
    </Avatar>
  );
}
