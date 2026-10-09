import { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

const ITEMS = [
  { key: "all", label: "Tất cả sự kiện", to: "/events", match: (path, cat) => path === "/events" && !cat },
  ...CATEGORIES.map((c) => ({
    key: c.slug,
    label: c.label,
    to: `/events?category=${c.slug}`,
    match: (path, cat) => path === "/events" && cat === c.slug,
  })),
];

export function CategoryNav({ className }) {
  const { pathname, search } = useLocation();
  const category = pathname === "/events" ? new URLSearchParams(search).get("category") : null;
  const activeKey = ITEMS.find((it) => it.match(pathname, category))?.key;

  const listRef = useRef(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[aria-current="page"]');
    if (!list || !el) return;
    const left = el.offsetLeft;
    if (left < list.scrollLeft || left + el.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = Math.max(0, left - 16);
    }
  }, [activeKey]);

  return (
    <nav aria-label="Danh mục sự kiện" className={cn("bg-catbar", className)}>
      <Container className="max-lg:px-0">
        <ul ref={listRef} className="relative flex h-11 items-stretch gap-6 overflow-x-auto no-scrollbar max-lg:px-5 max-lg:mask-fade-x sm:max-lg:px-6 sm:gap-8 lg:h-14">
          {ITEMS.map((it) => {
            const active = it.key === activeKey;
            return (
              <li key={it.key} className="flex shrink-0">
                <Link
                  to={it.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                    active ? "text-primary" : "text-white/90 hover:text-primary"
                  )}
                >
                  {it.label}
                  {active ? <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
