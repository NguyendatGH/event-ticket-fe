import { motion } from "motion/react";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { EventCard } from "./EventCard";
import { EventGridSkeleton } from "./Skeletons";

const COLS = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Lưới sự kiện 4/2/1 cột (columns=3 cho cột nội dung hẹp).
 * loading → skeleton; renderItem để thay thẻ (vd. vé bán lại dùng thẻ riêng nhưng cùng lưới).
 */
export function EventGrid({ events = [], loading = false, columns = 4, skeletonCount = 8, priorityCount = 0, renderItem, className }) {
  if (loading) return <EventGridSkeleton count={skeletonCount} className={cn(COLS[columns], className)} />;
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className={cn("grid grid-cols-1 gap-x-6 gap-y-12", COLS[columns], className)}
    >
      {events.map((event, i) => (
        <motion.div key={event.id ?? i} variants={fadeUp}>
          {renderItem ? renderItem(event, i) : <EventCard event={event} priority={i < priorityCount} />}
        </motion.div>
      ))}
    </motion.div>
  );
}
