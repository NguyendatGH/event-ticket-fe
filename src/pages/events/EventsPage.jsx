import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData } from "@tanstack/react-query";
import { motion } from "motion/react";
import { SearchX } from "lucide-react";
import {
  flattenPages,
  totalOf,
  useEventFacets,
  useInfiniteEvents,
} from "@/api";
import { AnimatedNumber } from "@/components/motion";
import {
  Container,
  DebouncedSearch,
  EmptyState,
  ErrorState,
  EventCard,
  EventGrid,
  InfiniteSentinel,
} from "@/components/site";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { categoryLabel, EVENT_SORTS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { gridItem, inView as reveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ActiveFilterChips } from "./components/ActiveFilterChips";
import { FilterPanel } from "./components/FilterPanel";
import { FilterSheet } from "./components/FilterSheet";
import {
  activeChips,
  activeCount,
  applyPatch,
  clearFilters,
  readFilters,
} from "./filters";

const COL_ITEM = [0, 1, 2].map(gridItem);

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const [sheetOpen, setSheetOpen] = useState(false);

  const latest = useRef(searchParams);
  useEffect(() => {
    latest.current = searchParams;
  }, [searchParams]);
  const write = (next, opts) => {
    latest.current = next;
    setSearchParams(next, { preventScrollReset: true, ...opts });
  };
  const updateFilters = (patch, { replace = false } = {}) =>
    write(applyPatch(latest.current, patch), { replace });
  const resetFilters = () => write(clearFilters(latest.current));

  const facets = useEventFacets();
  const query = useInfiniteEvents(filters, { placeholderData: keepPreviousData });
  const events = flattenPages(query.data);
  const total = totalOf(query.data);
  const chips = activeChips(filters);

  const heading = filters.category
    ? categoryLabel(filters.category)
    : "Khám phá sự kiện";
  let tabTitle = filters.category ? heading : "Sự kiện";
  if (filters.q) tabTitle = `Tìm "${filters.q}"`;
  useDocumentTitle(tabTitle);

  const panelProps = {
    filters,
    facets: facets.data,
    facetsLoading: facets.isPending,
    onChange: (patch) => updateFilters(patch),
    onReset: resetFilters,
    hasActive: chips.length > 0,
  };

  let body;
  if (query.isError && !query.data) {
    body = <ErrorState error={query.error} onRetry={query.refetch} />;
  } else if (query.isPending) {
    body = <EventGrid loading columns={3} skeletonCount={9} />;
  } else if (events.length === 0) {
    body = (
      <EmptyState
        icon={SearchX}
        title={
          filters.q
            ? `Không tìm thấy sự kiện cho "${filters.q}"`
            : "Không có sự kiện phù hợp"
        }
        description="Thử bỏ bớt bộ lọc, đổi khoảng thời gian hoặc tìm theo tên ban tổ chức."
        action={
          chips.length ? (
            <Button variant="secondary" onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          ) : null
        }
      />
    );
  } else {
    body = (
      <>
        <div
          className={cn(
            "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3",
            "max-sm:[&_h3]:text-ui max-sm:[&_h3+p]:hidden",
            "transition-opacity duration-200",
            query.isPlaceholderData && "opacity-50",
          )}
        >
          {events.map((e, i) => (
            <motion.div key={e.id} variants={COL_ITEM[i % 3]} {...reveal}>
              <EventCard event={e} priority={i < 3} />
            </motion.div>
          ))}
        </div>
        <InfiniteSentinel query={query} />
      </>
    );
  }

  return (
    <Container className="pb-8">
      <div className="grid gap-x-12 lg:grid-cols-12">
        <aside
          className="hidden pt-14 lg:col-span-3 lg:block"
          aria-label="Bộ lọc sự kiện"
        >
          <div className="sticky top-[94px] max-h-[calc(100dvh-110px)] overflow-y-auto pr-2 pb-10 [scrollbar-width:thin]">
            <FilterPanel {...panelProps} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-9">
          <header className="pt-10 pb-6 md:pt-14">
            <p className="eyebrow mb-3">Sự kiện</p>
            <h1 className="text-h1 text-balance text-foreground">{heading}</h1>
          </header>

          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
            <DebouncedSearch
              value={filters.q}
              onCommit={(value) =>
                updateFilters({ q: value || null }, { replace: true })
              }
              placeholder="Tìm theo tên sự kiện hoặc ban tổ chức"
              label="Tìm sự kiện"
              className="w-full min-w-0 md:w-auto md:flex-1"
            />
            <p
              className="mr-auto text-sm whitespace-nowrap text-muted-foreground max-sm:w-full md:order-first md:mr-3"
              aria-live="polite"
            >
              {query.isPending ? (
                "Đang tìm..."
              ) : (
                <>
                  <AnimatedNumber
                    value={total}
                    format={formatNumber}
                    className="font-medium text-foreground tabular-nums"
                  />{" "}
                  sự kiện
                </>
              )}
            </p>
            <FilterSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              panelProps={panelProps}
              activeCount={activeCount(filters)}
              total={total}
              loading={query.isPending}
            />
            <Select
              value={filters.sort}
              onValueChange={(sort) => updateFilters({ sort })}
            >
              <SelectTrigger
                id="events-sort"
                className="w-44 max-sm:flex-1 max-sm:px-4"
                aria-label="Sắp xếp"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {EVENT_SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chips.length ? (
            <ActiveFilterChips chips={chips} onRemove={(patch) => updateFilters(patch)} />
          ) : null}

          <div className="pt-8">{body}</div>
        </div>
      </div>
    </Container>
  );
}
