// Trang "Vé của tôi" — route /me/tickets?scope=upcoming|past (cần đăng nhập, nằm trong AccountLayout).
// Dữ liệu: useMyTickets.

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Ticket, TicketCheck } from "lucide-react";
import { flattenPages, totalOf, useMyTickets } from "@/api";
import { AccountEmpty, AccountPageHeader, PillTabs } from "@/components/account";
import { AnimatedItem, AnimatedList } from "@/components/motion";
import { ErrorState, InfiniteSentinel } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { TicketGroup, TicketGroupsSkeleton } from "./components/TicketGroup";

const SCOPES = [
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "past", label: "Đã qua" },
];
const SCOPE_VALUES = SCOPES.map((s) => s.value);
const PAGE_SIZE = 24;

const EMPTY = {
  upcoming: {
    icon: Ticket,
    title: "Chưa có vé cho sự kiện sắp tới",
    description: "Vé mua khi đã đăng nhập sẽ xuất hiện ở đây kèm mã QR để vào cổng.",
    action: { to: "/events", label: "Khám phá sự kiện" },
  },
  past: {
    icon: TicketCheck,
    title: "Chưa có sự kiện nào đã qua",
    description: "Vé của những sự kiện bạn đã tham dự sẽ được lưu lại ở đây.",
    action: { to: "/events", label: "Khám phá sự kiện" },
  },
};

export default function MyTicketsPage() {
  useDocumentTitle("Vé của tôi");
  const [params, setParams] = useSearchParams();
  const raw = params.get("scope");
  const scope = SCOPE_VALUES.includes(raw) ? raw : "upcoming";
  const q = useMyTickets({ scope, size: PAGE_SIZE });
  const total = totalOf(q.data);
  const groups = useMemo(() => groupByEvent(flattenPages(q.data)), [q.data]);
  const [now] = useState(() => Date.now());

  const changeScope = (value) => {
    const next = new URLSearchParams(params);
    if (value === "upcoming") next.delete("scope");
    else next.set("scope", value);
    setParams(next, { preventScrollReset: true });
  };

  const tabs = SCOPES.map((s) => ({ ...s, count: s.value === scope && q.isSuccess && total > 0 ? total : null, countLabel: "vé" }));

  let content;
  if (q.isPending) {
    content = <TicketGroupsSkeleton />;
  } else if (q.isError) {
    content = <ErrorState error={q.error} onRetry={q.refetch} />;
  } else if (groups.length === 0) {
    const empty = EMPTY[scope];
    content = (
      <AccountEmpty
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        action={
          <Button asChild>
            <Link to={empty.action.to}>{empty.action.label}</Link>
          </Button>
        }
      />
    );
  } else {
    content = (
      <>
        <AnimatedList as="div" className="space-y-4">
          {groups.map((g, i) => (
            <AnimatedItem as="div" key={g.key} index={i % 10}>
              <TicketGroup event={g.event} tickets={g.tickets} past={scope === "past"} now={now} />
            </AnimatedItem>
          ))}
        </AnimatedList>
        <InfiniteSentinel query={q} endLabel={total > 6 ? "Đã hiển thị tất cả vé" : null} />
      </>
    );
  }

  return (
    <>
      <AccountPageHeader
        icon={Ticket}
        title="Vé của tôi"
        description="Mang mã QR đến cổng soát vé. Vé mua khi chưa đăng nhập nằm trong email xác nhận đơn hàng."
      />
      <PillTabs label="Lọc vé" value={scope} onValueChange={changeScope} items={tabs}>
        {content}
      </PillTabs>
    </>
  );
}

function groupByEvent(tickets) {
  const groups = new Map();
  for (const t of tickets) {
    const key = t.event?.id ?? t.id;
    if (!groups.has(key)) groups.set(key, { key, event: t.event, tickets: [] });
    groups.get(key).tickets.push(t);
  }
  return [...groups.values()];
}
