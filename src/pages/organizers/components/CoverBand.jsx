import { motion } from "motion/react";
import { ImageWithFallback } from "@/components/site";
import { imageSettle } from "@/lib/motion";

export function CoverBand({ org, covers }) {
  const scrim = (
    <span
      className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
      aria-hidden="true"
    />
  );
  if (org.coverUrl) {
    return (
      <motion.div
        variants={imageSettle}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden bg-surface"
      >
        <ImageWithFallback
          src={org.coverUrl}
          alt={`Ảnh bìa ${org.name}`}
          priority
          fallback={null}
          className="h-56 w-full md:h-80"
        />
        {scrim}
      </motion.div>
    );
  }
  if (covers.length === 0) {
    return (
      <div
        className="h-24 bg-gradient-to-b from-background-2 to-background md:h-32"
        aria-hidden="true"
      />
    );
  }
  return (
    <motion.div
      variants={imageSettle}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="grid h-56 md:h-72"
        style={{
          gridTemplateColumns: `repeat(${covers.length}, minmax(0, 1fr))`,
        }}
      >
        {covers.map((src) => (
          <ImageWithFallback
            key={src}
            src={src}
            alt=""
            className="size-full opacity-45"
          />
        ))}
      </div>
      {scrim}
    </motion.div>
  );
}
