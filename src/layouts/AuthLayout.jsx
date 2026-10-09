import { Suspense } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Logo, PageLoader } from "@/components/site";
import { KenBurnsImage, PageTransition } from "@/components/motion";
import { EASE_INOUT, heroLine, heroStagger } from "@/lib/motion";
import { BRAND } from "@/lib/constants";
import { AUTH_ROUTES, AUTH_SCENES } from "./authScenes";

export default function AuthLayout() {
  const { pathname, state } = useLocation();
  const route = AUTH_ROUTES[pathname.replace(/\/$/, "")] || AUTH_ROUTES["/auth/login"];
  const scene = AUTH_SCENES[route.scene];

  return (
    <div className="grid min-h-dvh lg:grid-cols-12">
      <aside className="relative hidden overflow-hidden bg-surface lg:col-span-7 lg:block" aria-label="Sự kiện nổi bật">
        <AnimatePresence initial={false}>
          <motion.div
            key={route.scene}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE_INOUT }}
          >
            <KenBurnsImage src={scene.src} alt={scene.alt} priority duration={14} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" aria-hidden="true" />
        <motion.figure
          key={route.scene}
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="absolute inset-x-0 bottom-0 space-y-3 p-12 xl:p-16"
        >
          <motion.p variants={heroLine} className="eyebrow text-secondary-foreground">
            {scene.label}
          </motion.p>
          <motion.figcaption variants={heroLine} className="max-w-xl text-display tracking-[-0.03em] text-balance text-foreground">
            {scene.title}
          </motion.figcaption>
          <motion.div variants={heroLine} className="flex max-w-[44ch] flex-col gap-1 text-body-lg text-secondary-foreground">
            {scene.meta.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </motion.div>
        </motion.figure>
      </aside>

      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:col-span-5 lg:px-12 xl:px-16">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            <span className="hidden sm:inline">{route.prompt} </span>
            <Link to={route.action[1]} state={state} className="font-medium link-accent">
              {route.action[0]}
            </Link>
          </p>
        </header>

        <main className="flex flex-1 items-start pt-14 pb-12 md:items-center md:py-12">
          <PageTransition className="mx-auto w-full max-w-[420px]">
            <Suspense fallback={<PageLoader className="min-h-64" />}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-caption text-muted-foreground">
          <span>© 2026 {BRAND.name}</span>
          <Link to="/contact" className="link-quiet">
            Liên hệ hỗ trợ
          </Link>
        </footer>
      </div>
    </div>
  );
}
