import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container, PageHeader, SectionHeader } from "@/components/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { BRAND } from "@/lib/constants";
import { fadeUp, inView as reveal, stagger } from "@/lib/motion";
import { ContactForm } from "./components/ContactForm";
import { FAQ } from "./faq";

const SUPPORT_INFO = [
  [
    "Email hỗ trợ",
    <a
      href={`mailto:${BRAND.supportEmail}`}
      className="link-accent"
    >
      {BRAND.supportEmail}
    </a>,
  ],
  ["Giờ làm việc", BRAND.supportHours],
  ["Phản hồi", "Trong vòng một ngày làm việc"],
];

export default function ContactPage() {
  useDocumentTitle("Liên hệ");
  return (
    <Container>
      <PageHeader
        eyebrow="Hỗ trợ"
        title="Liên hệ"
        description="Hỏi về vé, đơn hàng hay cách tổ chức sự kiện. Chúng tôi trả lời qua email."
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-x-16 gap-y-14 py-12 md:py-16 lg:grid-cols-12"
      >
        <motion.aside
          variants={fadeUp}
          className="lg:col-span-4"
          aria-label="Thông tin liên hệ"
        >
          <dl className="border-t border-border">
            {SUPPORT_INFO.map(([label, value]) => (
              <div key={label} className="border-b border-border py-5">
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-2 text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Bạn là ban tổ chức?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tạo sự kiện và mở bán vé ngay, không cần chờ duyệt hồ sơ.
            </p>
            <Link
              to="/auth/register-organizer"
              className="arrow-nudge inline-flex items-center gap-1 text-sm link-accent"
            >
              Trở thành nhà tổ chức
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.aside>

        <motion.section
          variants={fadeUp}
          className="lg:col-span-7 lg:col-start-6"
          aria-labelledby="contact-form-title"
        >
          <h2
            id="contact-form-title"
            className="mb-8 scroll-mt-28 text-h3 text-foreground"
          >
            Gửi tin nhắn
          </h2>
          <ContactForm />
        </motion.section>
      </motion.div>

      <motion.section
        {...reveal}
        variants={fadeUp}
        id="faq"
        className="grid scroll-mt-28 gap-x-16 pt-8 lg:grid-cols-12"
        aria-labelledby="faq-title"
      >
        <div className="lg:col-span-4">
          <SectionHeader
            title={<span id="faq-title">Câu hỏi thường gặp</span>}
            className="mb-4 border-b-0 pb-0"
          />
          <p className="max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            Những câu hỏi về vé, đơn hàng và phí dịch vụ. Không thấy câu trả lời?{" "}
            <a href="#contact-form-title" className="link-accent">
              Gửi tin nhắn cho chúng tôi
            </a>
            .
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mt-8 border-t border-border lg:col-span-7 lg:col-start-6 lg:mt-0"
        >
          {FAQ.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`faq-${i}`}
              className="last:border-b"
            >
              <AccordionTrigger className="text-base transition-colors hover:text-primary hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-[64ch] pb-6 text-ui leading-relaxed text-secondary-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>
    </Container>
  );
}
