import { AnimatePresence, motion } from "motion/react";
import { Loader2, Lock } from "lucide-react";
import { AnimatedNumber } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { DUR, EASE_IN, EASE_OUT } from "@/lib/motion";

export function MobilePayBar({ show, total, busy }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } }}
          exit={{ y: "100%", transition: { duration: DUR.base, ease: EASE_IN } }}
          className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        >
          <div className="min-w-0">
            <p className="text-caption text-muted-foreground">Tổng</p>
            <AnimatedNumber value={total} from={total} format={formatVND} duration={DUR.slow} className="text-title font-semibold text-primary" />
          </div>
          <Button type="submit" form="checkout-form" disabled={busy} className="shrink-0">
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Lock aria-hidden="true" />}
            {busy ? "Đang xử lý…" : "Thanh toán"}
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
