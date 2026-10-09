import { ErrorState } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatBucketLabel } from "../lib";
import { BlockTitle } from "./OrgUi";

export function SrTable({ caption, rows, valueKey, format, interval }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.date}>
            <th scope="row">{formatBucketLabel(r.date, interval)}</th>
            <td>{format(r[valueKey])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ChartBlock({ title, total, query, size = "h-60", children }) {
  let content;
  if (query.isPending) content = <Skeleton className={cn(size, "w-full rounded-none opacity-60")} />;
  else if (query.isError) content = <ErrorState compact error={query.error} onRetry={query.refetch} />;
  else content = <div className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>{children}</div>;

  return (
    <section aria-label={title}>
      <BlockTitle title={title}>{total != null ? <span className="text-sm text-muted-foreground tabular-nums">{total}</span> : null}</BlockTitle>
      {content}
    </section>
  );
}
