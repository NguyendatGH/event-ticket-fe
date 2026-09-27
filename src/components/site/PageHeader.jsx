import { cn } from "@/lib/utils";

/**
 * Đầu trang: nhãn nhỏ (tùy chọn), tiêu đề H1, mô tả, hành động bên phải; kết thúc bằng divider.
 *   <PageHeader eyebrow="Tài khoản" title="Vé của tôi" actions={<Button>…</Button>} />
 */
export function PageHeader({ eyebrow, title, description, actions, children, className, divider = true }) {
  return (
    <header className={cn("pt-10 pb-8 md:pt-14 md:pb-10", divider && "border-b border-border", className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="text-h1 text-balance text-foreground">{title}</h1>
          {description ? <p className="max-w-[62ch] text-body-lg text-secondary-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}
