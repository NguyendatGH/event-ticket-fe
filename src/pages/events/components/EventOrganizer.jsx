// Khối "Ban tổ chức" trên trang chi tiết sự kiện.

import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { UserAvatar } from "@/components/site";
import { BRAND } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

export function EventOrganizer({ organizer }) {
  return (
    <>
      <div className="flex items-start gap-5">
        <UserAvatar
          name={organizer.name}
          src={organizer.logoUrl}
          size="lg"
          fallbackClassName="bg-primary/10 text-primary"
        />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <Link
              to={`/organizers/${organizer.slug}`}
              className="text-h3 text-foreground transition-colors hover:text-primary"
            >
              {organizer.name}
            </Link>
            {organizer.verified ? (
              <span className="inline-flex items-center gap-1 text-caption text-primary">
                <BadgeCheck className="size-4" aria-hidden="true" />
                Đã xác thực
              </span>
            ) : null}
          </p>
          {organizer.eventsCount != null ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {formatNumber(organizer.eventsCount)} sự kiện trên {BRAND.name}
            </p>
          ) : null}
        </div>
      </div>
      {organizer.description ? (
        <p className="mt-5 max-w-[68ch] leading-relaxed text-secondary-foreground">
          {organizer.description}
        </p>
      ) : null}
      <Link
        to={`/organizers/${organizer.slug}`}
        className="arrow-nudge mt-5 inline-flex items-center gap-1.5 text-sm link-accent"
      >
        Xem trang ban tổ chức
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </>
  );
}
