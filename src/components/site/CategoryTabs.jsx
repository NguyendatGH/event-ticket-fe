import { useId } from "react";
import { LayoutGroup, motion } from "motion/react";
import { TabIndicator } from "@/components/motion/TabIndicator";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryTabs({ value = "", onChange, categories = CATEGORIES, includeAll = true, counts, className, label = "Danh mục" }) {
  const items = includeAll ? [{ slug: "", label: "Tất cả" }, ...categories] : categories;
  const groupId = useId();
  return (
    <nav aria-label={label} className={cn("border-b border-border", className)}>
      <LayoutGroup id={groupId}>
      <motion.ul layoutScroll className="-mb-px flex gap-7 overflow-x-auto no-scrollbar md:gap-9">
        {items.map((c) => {
          const active = (value || "") === c.slug;
          return (
            <li key={c.slug || "all"} className="shrink-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChange?.(c.slug)}
                className={cn(
                  "relative inline-flex cursor-pointer items-baseline gap-1.5 border-b-2 border-transparent pt-1 pb-3.5 text-sm font-medium transition-colors focus-ring focus-visible:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {c.label}
                {counts?.[c.slug] != null ? <span className="text-xs text-muted-foreground tabular-nums">{counts[c.slug]}</span> : null}
                {active ? <TabIndicator id="category-tabs" /> : null}
              </button>
            </li>
          );
        })}
      </motion.ul>
      </LayoutGroup>
    </nav>
  );
}
