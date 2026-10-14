import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, QrCode, Ticket } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Container, ImageWithFallback } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { imageAt } from "@/lib/image";

const ORGANIZER_PHOTO = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80";

const SELLING_POINTS = [
  { icon: Ticket, text: "Lưu nháp, xem trước rồi mới công bố" },
  { icon: BarChart3, text: "Theo dõi vé bán và doanh thu theo ngày" },
  { icon: QrCode, text: "Khách nhận vé QR ngay sau thanh toán" },
];

function ctaFor({ isAuthenticated, isOrganizer }) {
  if (isOrganizer) return { to: "/organizer", label: "Vào trang quản lý" };
  if (isAuthenticated) return { to: "/become-organizer", label: "Trở thành nhà tổ chức" };
  return { to: "/auth/register-organizer", label: "Trở thành nhà tổ chức" };
}

export function OrganizerCta() {
  const cta = ctaFor(useAuth());
  return (
    <section aria-labelledby="home-organizer-title" className="pt-5 md:pt-7">
      <Container>
        <Reveal size="sm" className="relative isolate grid overflow-hidden rounded-card bg-card ring-1 ring-white/6 md:grid-cols-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_0%_100%,rgba(45,194,117,0.22),transparent_70%)]"
          />
          <div className="relative aspect-wide md:order-2 md:aspect-auto md:min-h-80">
            <ImageWithFallback
              src={imageAt(ORGANIZER_PHOTO, 900)}
              alt="Sân khấu ca nhạc với dàn đèn và khán giả phía trước"
              className="absolute inset-0 size-full"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-card to-transparent to-60% md:bg-linear-to-r md:to-50%" />
          </div>
          <div className="relative flex flex-col items-start p-6 md:p-10">
            <p className="text-xs font-semibold tracking-caps text-primary-bright uppercase">Dành cho ban tổ chức</p>
            <h2 id="home-organizer-title" className="mt-3 text-2xl leading-tight font-bold text-balance text-foreground md:text-3xl">
              Mở bán vé cho sự kiện của bạn
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm text-secondary-foreground">
              {SELLING_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-7">
              <Link to={cta.to}>
                {cta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
