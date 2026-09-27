import { Link } from "react-router-dom";
import { ArrowRight, Clock, Mail } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { createEventHref, useAuth } from "@/hooks/useAuth";
import { Container } from "./Container";
import { Logo } from "./Logo";

/** Một cột link: tiêu đề nhỏ đậm + danh sách link chữ xám sáng. */
function LinkColumn({ title, links }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-footer-foreground">{title}</h2>
      <ul className="space-y-3">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-footer-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Footer v2 (design-spec mục v2): nền xanh-xám (bg-footer), 3 cột.
 *   Liên hệ: giờ hỗ trợ, email hỗ trợ tô xanh nổi bật (không có hotline), link /contact
 *   Dành cho khách hàng: Vé của tôi, Đơn hàng, Vé bán lại, Câu hỏi thường gặp (/contact#faq)
 *   Về <BRAND.name> / Ban tổ chức: Tạo sự kiện, Trở thành ban tổ chức (hoặc Bảng điều khiển), Điều khoản (/contact)
 * Dưới cùng: logo + tagline + ©. Chữ trên nền footer: text-footer-foreground / text-footer-muted (≥ 7:1 / 5.6:1).
 */
export function Footer() {
  const { isAuthenticated, isOrganizer } = useAuth();
  const organizerLinks = [
    ["Tạo sự kiện", createEventHref({ isAuthenticated, isOrganizer })],
    isOrganizer ? ["Bảng điều khiển ban tổ chức", "/organizer"] : ["Trở thành ban tổ chức", "/become-organizer"],
    ["Điều khoản sử dụng", "/contact"],
    ["Liên hệ", "/contact"],
  ];

  return (
    <footer className="mt-16 bg-footer bg-linear-to-b from-(--footer-bg-top) to-footer text-footer-foreground md:mt-24">
      <Container className="grid gap-x-10 gap-y-10 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        <div>
          <h2 className="mb-4 text-sm font-semibold">Liên hệ hỗ trợ</h2>
          <p className="flex items-center gap-2 text-sm text-footer-muted">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            {BRAND.supportHours}
          </p>
          <p className="mt-3 flex items-center gap-2">
            <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <a href={`mailto:${BRAND.supportEmail}`} className="text-lg font-semibold text-primary transition-colors hover:text-primary-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {BRAND.supportEmail}
            </a>
          </p>
          <Link
            to="/contact"
            className="group mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-footer-foreground arrow-nudge hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Gửi yêu cầu hỗ trợ
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <LinkColumn
          title="Dành cho khách hàng"
          links={[
            ["Vé của tôi", "/me/tickets"],
            ["Đơn hàng", "/me/orders"],
            ["Vé bán lại", "/resale"],
            ["Câu hỏi thường gặp", "/contact#faq"],
          ]}
        />

        <LinkColumn title={`Về ${BRAND.wordmark} · Ban tổ chức`} links={organizerLinks} />
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-caption text-footer-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo className="text-base text-white" />
            <span>{BRAND.tagline}</span>
          </div>
          <span>© 2026 {BRAND.name}</span>
        </Container>
      </div>
    </footer>
  );
}
