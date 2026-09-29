// Mọi thông số chuyển động của app nằm ở đây (package `motion`, import từ "motion/react").

export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_IN = [0.4, 0, 1, 1];
export const EASE_INOUT = [0.65, 0, 0.35, 1];

export const DUR = { press: 0.1, fast: 0.15, base: 0.22, moderate: 0.32, slow: 0.55, slower: 0.8, count: 0.9, drift: 9 };
export const DIST = { xs: 3, sm: 8, md: 16, lg: 24 };
export const SPRING = {
  indicator: { type: "spring", visualDuration: 0.32, bounce: 0 },
  layout: { type: "spring", visualDuration: 0.38, bounce: 0 },
  press: { type: "spring", visualDuration: 0.18, bounce: 0 },
};
export const VIEWPORT = { once: true, amount: "some", margin: "0px 0px 15% 0px" };
export const HAS_IO = typeof IntersectionObserver !== "undefined";

export const fadeUp = {
  hidden: { opacity: 0, y: DIST.md },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const staggerOf = (each, delay = 0.04) => ({ hidden: {}, show: { transition: { staggerChildren: each, delayChildren: delay } } });

export const heroStagger = staggerOf(0.08, 0.15);

export const inView = HAS_IO ? { initial: "hidden", whileInView: "show", viewport: VIEWPORT } : { initial: "hidden", animate: "show" };

export const riseSm = {
  hidden: { opacity: 0, y: DIST.sm },
  show: { opacity: 1, y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
};

export const heroLine = {
  hidden: { opacity: 0, y: DIST.lg },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
};

export const imageSettle = {
  hidden: { opacity: 0, scale: 1.04 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_OUT } },
};

export const gridItem = (i) => ({
  hidden: { opacity: 0, y: DIST.md },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT, delay: Math.min(i, 7) * 0.05 } },
});

export const rowItem = {
  initial: { opacity: 0, y: DIST.sm },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
  exit: { opacity: 0, x: -DIST.sm, transition: { duration: DUR.base * 0.8, ease: EASE_IN } },
};

export const messageIn = { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, transition: { duration: DUR.base, ease: EASE_OUT } };

export const slideStep = {
  enter: (d) => ({ opacity: 0, x: d * DIST.lg }),
  center: { opacity: 1, x: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
  exit: (d) => ({ opacity: 0, x: d * -DIST.lg, transition: { duration: DUR.base * 0.8, ease: EASE_IN } }),
};
