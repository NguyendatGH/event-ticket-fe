import { useWatch } from "react-hook-form";
import { BadgeCheck } from "lucide-react";
import { ImageWithFallback, UserAvatar } from "@/components/site";
import { formatNumber } from "@/lib/format";

export function ProfilePreview({ control, profile }) {
  const values = useWatch({ control });
  const site = values.website?.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return (
    <div className="border border-border bg-background-2">
      <ImageWithFallback src={values.coverUrl} alt="" fallback={null} className="aspect-3/1 w-full" />
      <div className="p-5">
        <div className="flex items-center gap-4">
          <UserAvatar name={values.name || "?"} src={values.logoUrl} size="lg" className="shrink-0" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-lg font-semibold text-foreground">
              <span className="truncate">{values.name || "Tên ban tổ chức"}</span>
              {profile.verified ? <BadgeCheck className="size-4.5 shrink-0 text-primary" aria-label="Đã xác thực" /> : null}
            </p>
            <p className="text-meta text-muted-foreground">
              {[values.city, `${formatNumber(profile.eventsCount ?? 0)} sự kiện`].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
        <p className="mt-5 line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-secondary-foreground">
          {values.description || <span className="text-disabled-foreground">Chưa có phần giới thiệu.</span>}
        </p>
        {site || values.contactEmail || values.contactPhone ? (
          <dl className="mt-5 border-t border-border text-meta">
            {[
              ["Website", site],
              ["Email", values.contactEmail],
              ["Điện thoại", values.contactPhone],
            ]
              .filter(([, val]) => val)
              .map(([k, val]) => (
                <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-border py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="truncate text-foreground">{val}</dd>
                </div>
              ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}
