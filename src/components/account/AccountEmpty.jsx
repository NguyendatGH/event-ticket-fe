import { cn } from "@/lib/utils";

/**
 * Trạng thái rỗng khu tài khoản: khung viền đứt, icon lớn trong vòng tròn xanh phát sáng nhẹ (thay minh họa), tiêu đề, mô tả, CTA.
 *
 *   <AccountEmpty icon={Ticket} title="Chưa có vé" description="…" action={<Button asChild><Link to="/events">Khám phá sự kiện</Link></Button>} />
 */
export function AccountEmpty({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center rounded-card border border-dashed border-white/12 bg-card/40 px-5 py-14 text-center md:py-16", className)}>
      {Icon ? (
        <span aria-hidden="true" className="relative mb-6 grid size-20 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/35">
          <span className="absolute inset-2 rounded-full bg-primary/10 blur-md" />
          <Icon className="relative size-9 text-primary" strokeWidth={1.5} />
        </span>
      ) : null}
      <p className="text-lg font-bold text-foreground">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
