import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Price } from "@/components/site";
import { Button } from "@/components/ui/button";
import { DUR, EASE_IN, EASE_OUT } from "@/lib/motion";
import { purchaseState } from "../lib";

// Thanh trồi từ đáy lên, rời đi nhanh hơn lúc vào
const buyBar = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
  exit: { y: "100%", transition: { duration: DUR.base, ease: EASE_IN } },
};

/**
 * Thanh mua vé cố định đáy màn hình (chỉ dưới lg), hiện khi khối chọn vé (#chon-ve) đã cuộn lên khỏi màn hình.
 * Dùng IntersectionObserver thay vì nghe sự kiện scroll: trình duyệt tự báo khi khối ra/vào màn hình,
 * không phải chạy code ở mỗi pixel cuộn.
 */
export function MobileBuyBar({ event }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById("chon-ve");
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    // Hiện khi khối chọn vé không còn trên màn hình VÀ nằm phía trên (đã cuộn qua),
    // không hiện khi khối còn ở bên dưới (người dùng chưa cuộn tới).
    const io = new IntersectionObserver(([e]) =>
      setShow(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const state = purchaseState(event.status);
  if (!state.open) return null;
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          {...buyBar}
          className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {event.name}
            </p>
            {event.priceFrom != null ? (
              <Price value={event.priceFrom} from size="sm" />
            ) : null}
          </div>
          <Button
            size="sm"
            onClick={() =>
              document
                .getElementById("chon-ve")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Chọn vé
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
