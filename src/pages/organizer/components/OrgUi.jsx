// Bộ UI nhỏ dùng chung cho mọi trang khu organizer (/organizer/...):

import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "motion/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/motion";
import { BackLink, ErrorState } from "@/components/site";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DUR, EASE_OUT, HAS_IO, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const TH_ROW = "border-b border-border text-left text-xs tracking-caps whitespace-nowrap text-muted-foreground uppercase";
export const TH = "py-3 font-medium";
export const ROW = "border-b border-border transition-colors hover:bg-background-2";

export function OrgHeader({ eyebrow, title, meta, actions, back, children, className }) {
  return (
    <header className={cn("border-b border-border pb-6 md:pb-8", className)}>
      {back ? (
        <BackLink to={back.to} className="mb-6">
          {back.label}
        </BackLink>
      ) : null}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="text-h2 text-balance text-foreground">{title}</h1>
          {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

/**
 * Một dòng "nhãn — giá trị" trong bảng xem lại trước khi bấm chốt (dùng trong <dl>).
 * Nằm ở đây vì cả dialog chuyển khoản tay và dialog hủy hoàn tiền đều cần đúng khối này.
 */
export function Recap({ label, value }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{value}</dd>
    </div>
  );
}

export function BlockTitle({ title, children, className, id }) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-3", className)}>
      <h2 id={id} className="heading-caps">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function StatStrip({ items, className }) {
  return (
    <dl className={cn("grid grid-cols-2 border-b border-border lg:grid-cols-[1.45fr_1fr_1fr_1fr]", className)}>
      {items.map((item, i) => (
        <div key={item.label} className={cn("flex min-w-0 flex-col gap-2 py-6 lg:py-8", statCell(i))}>
          <dt className="eyebrow order-2">{item.label}</dt>
          <dd className="order-1 truncate text-[clamp(1.5rem,1.1rem+1.3vw,2.25rem)] leading-none font-semibold tracking-tight text-foreground tabular-nums">
            {item.value != null && typeof item.value === "object" ? <AnimatedNumber value={item.value.n} format={item.value.format} /> : item.value}
          </dd>
          {item.sub ? (
            <dd className={cn("order-3 text-meta leading-snug", item.toneClass || "text-muted-foreground")}>
              {item.trend ? <TrendPill trend={item.trend}>{item.sub}</TrendPill> : item.sub}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

function TrendPill({ trend, children }) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  const [pct, ...rest] = String(children).split(" ");
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className={cn("inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-medium tabular-nums", trend === "up" ? "bg-primary/10" : "bg-destructive/10")}>
        <Icon className="size-3.5" aria-hidden="true" />
        {pct}
      </span>
      <span className="text-muted-foreground">{rest.join(" ")}</span>
    </span>
  );
}

const statCell = (i) =>
  cn(
    "border-border",
    i === 0 && "max-lg:col-span-2 pr-4 pl-0 lg:pr-6",
    i > 0 && "max-lg:border-t",
    i % 2 === 1 && "pr-4 pl-0 lg:border-l lg:px-6",
    i > 0 && i % 2 === 0 && "border-l px-4 lg:px-6",
    i === 3 && "max-lg:col-span-2"
  );

export function StatStripSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 border-b border-border lg:grid-cols-[1.45fr_1fr_1fr_1fr]" role="status" aria-label="Đang tải số liệu">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("space-y-3 py-6 lg:py-8", statCell(i))}>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function SoldMeter({ sold = 0, total = 0, reserved = 0, className, label, delay = 0 }) {
  const s = total > 0 ? Math.min(1, sold / total) : 0;
  const r = total > 0 ? Math.min(1 - s, reserved / total) : 0;
  const shown = s > 0 ? Math.max(s, 0.02) : 0;
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: VIEWPORT.amount, margin: VIEWPORT.margin }) || !HAS_IO;
  const fill = (to, d = delay) => ({
    initial: { scaleX: 0 },
    animate: seen ? { scaleX: to, transition: { duration: DUR.slower, ease: EASE_OUT, delay: d } } : { scaleX: 0 },
  });
  return (
    <div
      ref={ref}
      className={cn("relative h-1.5 w-full overflow-hidden bg-border", className)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={total || 0}
      aria-valuenow={sold}
      aria-label={label || `Đã bán ${sold} trên ${total}`}
    >
      {r > 0 ? (
        <motion.div aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-secondary-foreground/40" {...fill(Math.min(1, shown + r), delay + 0.15)} />
      ) : null}
      <motion.div aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-primary" {...fill(shown)} />
    </div>
  );
}

export function OrgField({ label, htmlFor, error, hint, optional, children, className }) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className={cn("grid content-start gap-2", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className={cn("text-meta font-medium text-secondary-foreground", error && "text-destructive")}>
          {label}
          {optional ? <span className="font-normal text-disabled-foreground">Không bắt buộc</span> : null}
        </Label>
      ) : null}
      {typeof children === "function" ? children({ "aria-invalid": Boolean(error) || undefined, "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined }) : children}
      {hint && !error ? (
        <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23818985' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function NativeSelect({ className, placeholder, style, children, ...props }) {
  return (
    <select
      className={cn(
        fieldClass,
        "h-10 w-full cursor-pointer appearance-none bg-size-[14px] bg-position-[right_12px_center] bg-no-repeat pr-9 pl-3",
        placeholder && "text-disabled-foreground",
        className
      )}
      style={{ backgroundImage: CHEVRON, ...style }}
      {...props}
    >
      {children}
    </select>
  );
}

export function EventLoadError({ error, onRetry }) {
  const notFound = error?.status === 404;
  return (
    <div>
      <ErrorState
        error={notFound ? { message: "Sự kiện không tồn tại hoặc thuộc ban tổ chức khác." } : error}
        onRetry={notFound ? undefined : onRetry}
        title={notFound ? "Không tìm thấy sự kiện" : undefined}
      />
      <div className="flex justify-center">
        <Link to="/organizer/events" className="text-sm link-accent">
          Về danh sách sự kiện
        </Link>
      </div>
    </div>
  );
}

export function LoadMore({ query, label = "Tải thêm", className }) {
  let inner;
  if (query.isFetchNextPageError) {
    inner = <ErrorState compact error={query.error} onRetry={() => query.fetchNextPage()} />;
  } else if (query.hasNextPage) {
    inner = (
      <Button variant="secondary" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
        {label}
      </Button>
    );
  } else {
    inner = <p className="text-caption text-disabled-foreground">Đã hiển thị tất cả</p>;
  }
  return <div className={cn("flex min-h-16 items-center justify-center", className)}>{inner}</div>;
}
