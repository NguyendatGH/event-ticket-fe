/**
 * Chợ vé bán lại — route /resale?q=&sort=&category=&city=&priceMin=&priceMax=&eventId=
 * Mọi bộ lọc nằm trên URL (chia sẻ link / F5 / Back giữ nguyên kết quả). Đổi lọc = sửa URL qua `update()`.
 * Dữ liệu: useResaleListings (GET /resale/listings, cuộn vô hạn), useEventFacets (danh sách thành phố),
 * useEvent(eventId) để hiện tên sự kiện trên chip khi lọc theo một sự kiện.
 */
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { BadgeCheck, QrCode, Scale, SlidersHorizontal } from "lucide-react";
import { flattenPages, totalOf, useEvent, useEventFacets, useResaleListings } from "@/api";
import { Container, DebouncedSearch, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CITIES, RESALE_SORTS, categoryLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { AnimatedNumber, RevealGroup, RevealItem } from "@/components/motion";
import { priceRangeLabel } from "./lib";
import { FilterChip } from "./components/FilterChip";
import { InfoItem } from "./components/InfoItem";
import { ListingFilters } from "./components/ListingFilters";
import { ListingResults } from "./components/ListingResults";

/** Tham số lọc đọc từ URL (ngoài q và sort). */
const FILTER_KEYS = ["category", "city", "priceMin", "priceMax", "eventId"];
const DEFAULT_SORT = "newest";
const SORT_VALUES = new Set(RESALE_SORTS.map((s) => s.value));
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 3 cam kết hiện dưới tiêu đề trang. */
const PROMISES = [
  { icon: BadgeCheck, title: "Vé đã xác thực", text: "Mỗi vé gắn với đơn hàng gốc trên hệ thống, không phải ảnh chụp màn hình." },
  { icon: Scale, title: "Giá trần", text: "Giá bán lại không được vượt mức trần tính theo giá gốc." },
  { icon: QrCode, title: "Mã QR mới", text: "Thanh toán xong, vé chuyển sang tài khoản của bạn với mã mới. Mã cũ bị vô hiệu." },
];

export default function MarketplacePage() {
  useDocumentTitle("Vé bán lại");
  const [searchParams, setSearchParams] = useSearchParams();
  const get = (k) => searchParams.get(k) || "";

  const q = get("q");
  // Link cũ / sửa tay (?sort=-date, ?eventId=abc) → BE trả 400. Giá trị lạ thì bỏ qua, về mặc định.
  const sort = SORT_VALUES.has(get("sort")) ? get("sort") : DEFAULT_SORT;
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, get(k)]));
  if (filters.eventId && !UUID_RE.test(filters.eventId)) filters.eventId = "";

  /** Ghi các thay đổi lọc lên URL: giá trị rỗng → xóa tham số; sort mặc định thì không ghi. */
  const update = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (next.get("sort") === DEFAULT_SORT) next.delete("sort");
    setSearchParams(next, { preventScrollReset: true });
  };

  const query = useResaleListings({ q, sort, ...filters });
  const listings = flattenPages(query.data);
  const total = totalOf(query.data);

  const facets = useEventFacets();
  const cities = facets.data?.cities?.length ? facets.data.cities.map((c) => c.name) : CITIES;
  const eventQ = useEvent(filters.eventId, { retry: false });

  const activeCount = ["category", "city"].filter((k) => filters[k]).length + (filters.priceMin || filters.priceMax ? 1 : 0);
  const hasAnyFilter = Boolean(q || activeCount || filters.eventId);
  const clearAll = () => setSearchParams(sort !== DEFAULT_SORT ? { sort } : {}, { preventScrollReset: true });

  const chips = [
    filters.eventId && {
      key: "eventId",
      text: `Sự kiện: ${eventQ.data?.name || (eventQ.isError ? "không xác định" : "đang tải...")}`,
      remove: () => update({ eventId: "" }),
    },
    filters.category && { key: "category", text: categoryLabel(filters.category), remove: () => update({ category: "" }) },
    filters.city && { key: "city", text: filters.city, remove: () => update({ city: "" }) },
    (filters.priceMin || filters.priceMax) && {
      key: "price",
      text: priceRangeLabel(filters.priceMin, filters.priceMax),
      remove: () => update({ priceMin: "", priceMax: "" }),
    },
  ].filter(Boolean);

  const filterPanel = <ListingFilters values={filters} cities={cities} onChange={update} />;

  return (
    <Container className="pb-24">
      <PageHeader
        title="Vé bán lại"
        description="Vé do người mua trước nhượng lại khi không thể tham dự. Mua an toàn, đúng giá, nhận vé ngay sau khi thanh toán."
      >
        {/* Mobile: rail cuộn ngang một hàng (không đẩy danh sách vé xuống ~300px). md+: 3 cột. */}
        <RevealGroup
          as="ul"
          immediate
          className="mt-8 -mr-5 flex snap-x snap-mandatory gap-3 overflow-x-auto border-t border-border pt-5 pr-5 no-scrollbar md:mt-10 md:mr-0 md:grid md:grid-cols-3 md:gap-0 md:divide-x md:divide-border md:overflow-visible md:pt-6 md:pr-0"
        >
          {PROMISES.map(({ icon, title, text }) => (
            <RevealItem
              as="li"
              size="sm"
              key={title}
              className="w-[78%] shrink-0 snap-start border border-border p-4 md:w-auto md:border-0 md:p-0 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <InfoItem icon={icon} title={title}>
                {text}
              </InfoItem>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageHeader>

      <div className="grid gap-10 pt-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside className="hidden lg:block" aria-label="Bộ lọc">
          <p className="eyebrow mb-6">Bộ lọc</p>
          {filterPanel}
        </aside>

        <section aria-labelledby="resale-results" className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <DebouncedSearch value={q} onCommit={(v) => update({ q: v })} placeholder="Tìm theo tên sự kiện" label="Tìm vé bán lại" className="flex-1" />
            <div className="flex gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="flex-1 lg:hidden">
                    <SlidersHorizontal aria-hidden="true" />
                    Bộ lọc{activeCount ? ` (${activeCount})` : ""}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[86%] overflow-y-auto">
                  <SheetHeader className="border-b border-border px-5 py-5">
                    <SheetTitle>Bộ lọc</SheetTitle>
                    <SheetDescription>Lọc vé theo danh mục, thành phố và giá.</SheetDescription>
                  </SheetHeader>
                  <div className="px-5 py-2">{filterPanel}</div>
                  {activeCount ? (
                    <SheetFooter className="border-t border-border px-5">
                      <Button variant="ghost" onClick={() => update({ category: "", city: "", priceMin: "", priceMax: "" })}>
                        Xóa bộ lọc
                      </Button>
                    </SheetFooter>
                  ) : null}
                </SheetContent>
              </Sheet>
              <Select value={sort} onValueChange={(v) => update({ sort: v })}>
                <SelectTrigger className="flex-1 sm:w-50 sm:flex-none" aria-label="Sắp xếp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {RESALE_SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pb-5">
            <h2 id="resale-results" className="text-sm text-muted-foreground" aria-live="polite">
              {query.isPending ? (
                "Đang tìm vé..."
              ) : query.isError ? (
                "Vé bán lại"
              ) : (
                <>
                  <AnimatedNumber value={total} format={formatNumber} className="font-medium text-foreground tabular-nums" /> vé đang bán
                  {q ? <> cho &ldquo;{q}&rdquo;</> : null}
                </>
              )}
            </h2>
            {chips.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {chips.map((c) => (
                    <FilterChip key={c.key} onRemove={c.remove} label={`Bỏ lọc ${c.text}`}>
                      {c.text}
                    </FilterChip>
                  ))}
                </AnimatePresence>
                {chips.length > 1 ? (
                  <button type="button" onClick={clearAll} className="ml-1 cursor-pointer text-meta link-quiet underline-offset-4 hover:underline">
                    Xóa tất cả
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="pt-10">
            <ListingResults
              query={query}
              listings={listings}
              hasAnyFilter={hasAnyFilter}
              onClearAll={clearAll}
              eventSlug={filters.eventId ? eventQ.data?.slug : undefined}
            />
          </div>
        </section>
      </div>
    </Container>
  );
}
