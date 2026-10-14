import { useEffect, useId, useRef } from "react";
import { LayoutGroup, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { TabIndicator } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STEPS } from "./schema";

export function StepNav({ step, hasError, isDone, onGo }) {
  const groupId = useId();
  const navRef = useRef(null);
  useEffect(() => {
    const nav = navRef.current;
    const el = nav?.querySelector('[aria-current="step"]');
    if (!nav || !el || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: el.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  }, [step]);

  return (
    <LayoutGroup id={groupId}>
      <motion.nav ref={navRef} layoutScroll aria-label="Các bước" className="relative -mb-px flex min-w-0 snap-x gap-6 overflow-x-auto no-scrollbar md:gap-8">
        {STEPS.map((s, i) => {
          const active = i === step;
          const error = hasError(i);
          const done = !active && !error && isDone(i);

          let numberColor = "text-disabled-foreground";
          if (error) numberColor = "text-destructive";
          else if (active || done) numberColor = "text-primary";

          let labelColor = "text-muted-foreground group-hover:text-foreground";
          if (error) labelColor = "text-destructive";
          else if (active) labelColor = "text-foreground";

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onGo(i)}
              aria-current={active ? "step" : undefined}
              className="group relative flex shrink-0 cursor-pointer snap-start items-center gap-2 pt-4 pb-3.5 text-left focus-ring"
            >
              <span className={cn("inline-flex w-4 justify-center text-xs font-medium tabular-nums transition-colors", numberColor)}>
                {done ? <Check className="size-3.5" aria-hidden="true" /> : String(i + 1).padStart(2, "0")}
              </span>
              <span className={cn("text-xs font-medium tracking-caps whitespace-nowrap uppercase transition-colors", labelColor)}>{s.label}</span>
              {error ? <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" /> : null}
              {error ? <span className="sr-only">(có lỗi)</span> : done ? <span className="sr-only">(đã xong)</span> : null}
              {active ? <TabIndicator id="editor-step" /> : null}
            </button>
          );
        })}
      </motion.nav>
    </LayoutGroup>
  );
}

export function StepPager({ step, onGo }) {
  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
      {step > 0 ? (
        <Button type="button" variant="ghost" onClick={() => onGo(step - 1)}>
          <ArrowLeft aria-hidden="true" />
          {STEPS[step - 1].label}
        </Button>
      ) : (
        <span />
      )}
      {step < STEPS.length - 1 ? (
        <Button type="button" variant="secondary" onClick={() => onGo(step + 1)}>
          {STEPS[step + 1].label}
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
