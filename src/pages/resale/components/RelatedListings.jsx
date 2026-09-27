import { motion } from "motion/react";
import { DEFAULT_PAGE_SIZE, useRelatedListings } from "@/api";
import { SectionHeader } from "@/components/site";
import { gridItem, inView } from "@/lib/motion";
import { listingGridClass } from "../lib";
import { ListingCard, ListingGridSkeleton } from "./ListingCard";

/** Mục "Vé tương tự" cuối trang /resale/:id (useRelatedListings, 4 tin). Lỗi hoặc rỗng → ẩn cả mục. */
export function RelatedListings({ id }) {
  const related = useRelatedListings(id, 4);
  if (related.isError || (related.isSuccess && !related.data?.length)) return null;
  return (
    <section aria-label="Vé tương tự" className="pt-24">
      <SectionHeader title="Vé tương tự" href="/resale" linkLabel="Xem tất cả vé bán lại" />
      {related.isPending ? (
        <ListingGridSkeleton count={4} columns={4} />
      ) : (
        <ul className={listingGridClass(4)}>
          {related.data.map((l, i) => (
            <motion.li key={l.id} variants={gridItem(i % DEFAULT_PAGE_SIZE)} {...inView}>
              <ListingCard listing={l} />
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
