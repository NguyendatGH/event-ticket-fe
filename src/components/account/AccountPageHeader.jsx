import { cn } from "@/lib/utils";

/**
 * Tiêu đề trang trong khu tài khoản: ô icon xanh nhỏ + H1 đậm trắng + mô tả, hành động bên phải.
 *
 *   <AccountPageHeader icon={Ticket} title="Vé của tôi" description="Mang mã QR đến cổng soát vé." actions={<Button>…</Button>} />
 *
 * Props: icon (lucide), title, description, actions, className. Không kẻ viền dưới (khác PageHeader v1).
 */
export function AccountPageHeader({ icon: Icon, title, description, actions, className }) {
  return (
    <header className={cn("mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 md:mb-6", className)}>
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon ? (
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/30 md:size-11" aria-hidden="true">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-bold text-balance text-foreground md:text-[28px]">{title}</h1>
          {description ? <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
