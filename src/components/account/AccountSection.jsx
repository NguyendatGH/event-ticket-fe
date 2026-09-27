import { cn } from "@/lib/utils";

/**
 * Thẻ bo 12px nền bg-card cho một khối nội dung trong khu tài khoản (hồ sơ, đổi mật khẩu, tin bán lại…).
 *
 *   <AccountSection id="password" title="Đổi mật khẩu" description="Dùng mật khẩu dài.">…</AccountSection>
 *
 * Props: id (gắn cho tiêu đề, section tự aria-labelledby), title, description, icon (lucide, tùy chọn),
 * actions (bên phải tiêu đề), as ("section"; "fieldset" cho nhóm field trong form), className, children.
 * as="fieldset": tên nhóm nằm trong <legend> ẩn (trình đọc màn hình đọc khi vào field), tiêu đề nhìn thấy là aria-hidden.
 */
export function AccountSection({ id, title, description, icon: Icon, actions, as: Tag = "section", className, children }) {
  const fieldset = Tag === "fieldset";
  return (
    <Tag
      aria-labelledby={!fieldset && title ? id : undefined}
      className={cn("min-w-0 rounded-card bg-card p-5 ring-1 ring-white/5 md:p-7", className)}
    >
      {fieldset && title ? <legend className="sr-only">{title}</legend> : null}
      {title ? (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4" aria-hidden={fieldset || undefined}>
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /> : null}
            <div className="min-w-0 space-y-1">
              {fieldset ? (
                <p className="text-lg leading-snug font-bold text-foreground">{title}</p>
              ) : (
                <h2 id={id} className="text-lg leading-snug font-bold text-foreground">
                  {title}
                </h2>
              )}
              {description ? <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
            </div>
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </Tag>
  );
}
