import { motion } from "motion/react";
import { EventCard, EventGrid, SectionHeader } from "@/components/site";
import { fadeUp, inView as reveal } from "@/lib/motion";

export function EventRail({ title, href, query, exclude }) {
  const items = (query.data ?? []).filter((e) => e.id !== exclude);
  if (query.isError || (!query.isPending && items.length === 0)) return null;
  const few = !query.isPending && items.length < 3;
  return (
    <motion.section {...reveal} variants={fadeUp} className="pt-20 md:pt-24">
      <SectionHeader title={title} href={href} />
      {few ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
          {items.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              className="[&_a>div:first-child]:aspect-video! [&_h3]:text-h3"
            />
          ))}
        </div>
      ) : (
        <EventGrid
          events={items.slice(0, 4)}
          loading={query.isPending}
          skeletonCount={4}
        />
      )}
    </motion.section>
  );
}
