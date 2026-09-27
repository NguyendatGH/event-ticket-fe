/**
 * Trang công khai của ban tổ chức, route "/organizers/:slug".
 * Dữ liệu: useOrganizer (GET /organizers/{slug}) cho phần đầu trang;
 * useOrganizerPublicEvents (GET /organizers/{slug}/events?scope=upcoming|past) cho lưới sự kiện theo tab.
 * Tab đang chọn nằm trên URL (?scope=past). 404 → trang "không tìm thấy", giữ nguyên URL.
 */
import { useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { flattenPages, useOrganizer, useOrganizerPublicEvents } from "@/api";
import { AnimatedNumber } from "@/components/motion";
import {
  CategoryTabs,
  Container,
  ErrorState,
  UserAvatar,
} from "@/components/site";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatNumber } from "@/lib/format";
import { heroLine, heroStagger } from "@/lib/motion";
import { NotFoundView } from "../NotFoundPage";
import { CoverBand } from "./components/CoverBand";
import { OrganizerContacts } from "./components/OrganizerContacts";
import { OrganizerEvents } from "./components/OrganizerEvents";
import { OrganizerSkeleton } from "./components/OrganizerSkeleton";

// Hai tab sự kiện (dùng lại CategoryTabs: cùng kiểu tab gạch chân, chỉ khác danh sách)
const SCOPES = [
  { slug: "upcoming", label: "Sắp diễn ra" },
  { slug: "past", label: "Đã diễn ra" },
];

// Đổi tab: lưới cũ mờ đi rồi lưới mới hiện lên
const scopeSwap = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Dùng làm `select`: chỉ lấy tối đa 3 ảnh bìa để ghép dải bìa. Component chỉ render lại khi danh sách ảnh đổi.
// Đặt ngoài component để hàm giữ nguyên tham chiếu giữa các lần render.
const coversOf = (data) =>
  flattenPages(data)
    .map((e) => e.coverImageUrl)
    .filter(Boolean)
    .slice(0, 3);

export default function OrganizerPublicPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const scope = params.get("scope") === "past" ? "past" : "upcoming";
  const orgQ = useOrganizer(slug);
  // Gọi song song với request ban tổ chức (cùng key với tab "Sắp diễn ra", không tốn thêm request)
  const covers = useOrganizerPublicEvents(
    slug,
    { scope: "upcoming" },
    { select: coversOf },
  ).data;
  const org = orgQ.data;
  useDocumentTitle(org?.name ?? "Ban tổ chức");

  // Tab "Sắp diễn ra" là mặc định nên không ghi lên URL; replace: đổi tab không thêm mục vào lịch sử
  const changeScope = (value) => {
    const next = new URLSearchParams(params);
    if (value === "upcoming") next.delete("scope");
    else next.set("scope", value);
    setParams(next, { preventScrollReset: true, replace: true });
  };

  if (orgQ.isError) {
    if (orgQ.error?.status === 404) {
      return (
        <NotFoundView
          title="Không tìm thấy ban tổ chức"
          description="Trang ban tổ chức không tồn tại hoặc đường dẫn đã thay đổi."
        />
      );
    }
    return (
      <Container>
        <ErrorState error={orgQ.error} onRetry={orgQ.refetch} />
      </Container>
    );
  }
  if (orgQ.isPending) return <OrganizerSkeleton />;

  return (
    <div>
      <CoverBand org={org} covers={covers ?? []} />

      <Container>
        <motion.header
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="relative z-10 -mt-16 grid gap-x-16 gap-y-10 border-b border-border pb-10 md:-mt-20 md:pb-14 lg:grid-cols-12"
        >
          <motion.div variants={heroLine} className="lg:col-span-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <UserAvatar
                name={org.name}
                src={org.imageUrl ?? org.logoUrl}
                size="xl"
                className="border-4 border-background"
                fallbackClassName="bg-primary/10 text-2xl text-primary"
              />
              <div className="min-w-0">
                <p className="eyebrow">Ban tổ chức</p>
                <h1 className="mt-2 text-h1 text-balance text-foreground">
                  {org.name}
                </h1>
              </div>
            </div>
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {org.verified ? (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                  Đã xác thực
                </span>
              ) : null}
              <span className="tabular-nums">
                <AnimatedNumber
                  value={org.eventsCount ?? 0}
                  format={formatNumber}
                />{" "}
                sự kiện
              </span>
            </p>
            {org.description ? (
              <p className="mt-6 max-w-[68ch] text-body-lg whitespace-pre-line text-secondary-foreground">
                {org.description}
              </p>
            ) : null}
          </motion.div>

          <OrganizerContacts org={org} />
        </motion.header>

        <section aria-label="Sự kiện của ban tổ chức" className="pt-10">
          <CategoryTabs
            label="Lọc sự kiện của ban tổ chức"
            categories={SCOPES}
            includeAll={false}
            value={scope}
            onChange={changeScope}
            className="mb-6"
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scope} {...scopeSwap}>
              <OrganizerEvents slug={slug} scope={scope} />
            </motion.div>
          </AnimatePresence>
        </section>
      </Container>
    </div>
  );
}
