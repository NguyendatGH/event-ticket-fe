/**
 * Trang 404, route "*" (mọi đường dẫn không khớp route nào). Không gọi API.
 * NotFoundView cũng được trang chi tiết sự kiện / ban tổ chức dùng lại khi BE trả 404 (giữ nguyên URL).
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container, SearchInput } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { heroLine, staggerOf } from "@/lib/motion";

// Các dòng chữ trồi lên lần lượt, cách nhau 80ms
const intro = staggerOf(0.08, 0.05);
const LINKS = [
  ["/events?when=weekend", "Sự kiện cuối tuần này"],
  ["/resale", "Vé bán lại"],
  ["/me/tickets", "Vé của tôi"],
  ["/contact", "Liên hệ hỗ trợ"],
];

/** Nội dung 404: tiêu đề, mô tả, ô tìm sự kiện (Enter → /events?q=), nút về trang chủ và vài link hữu ích. */
export function NotFoundView({
  title = "Không tìm thấy trang",
  description = "Đường dẫn không tồn tại hoặc nội dung đã bị gỡ. Thử tìm sự kiện bạn cần, hoặc quay về trang chủ.",
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  useDocumentTitle(title);
  return (
    <Container className="grid gap-12 py-20 md:py-28 lg:grid-cols-12">
      <motion.div
        variants={intro}
        initial="hidden"
        animate="show"
        className="lg:col-span-7"
      >
        <motion.p
          variants={heroLine}
          aria-hidden="true"
          className="text-[clamp(5rem,14vw,10rem)] leading-none font-semibold tracking-tight text-primary/15 tabular-nums select-none"
        >
          404
        </motion.p>
        <motion.p variants={heroLine} className="eyebrow mt-4">
          Lỗi 404
        </motion.p>
        <motion.h1
          variants={heroLine}
          className="mt-4 text-display text-balance text-foreground"
        >
          {title}
        </motion.h1>
        <motion.p
          variants={heroLine}
          className="mt-6 max-w-[52ch] text-body-lg text-secondary-foreground"
        >
          {description}
        </motion.p>
        <motion.div variants={heroLine}>
          <SearchInput
            value={q}
            onChange={setQ}
            onSubmit={(v) =>
              navigate(v ? `/events?q=${encodeURIComponent(v)}` : "/events")
            }
            placeholder="Tìm sự kiện, nhà tổ chức"
            className="mt-10 max-w-md"
          />
        </motion.div>
        <motion.div variants={heroLine} className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/events">Xem sự kiện</Link>
          </Button>
        </motion.div>
      </motion.div>
      <nav
        aria-label="Liên kết hữu ích"
        className="self-end lg:col-span-4 lg:col-start-9"
      >
        <ul className="border-t border-border">
          {LINKS.map(([to, label]) => (
            <li key={to} className="border-b border-border">
              <Link
                to={to}
                className="arrow-nudge flex items-center justify-between py-4 text-sm link-quiet"
              >
                {label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}

export default function NotFoundPage() {
  return <NotFoundView />;
}
