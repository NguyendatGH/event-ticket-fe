import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const hostOf = (url) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function OrganizerContacts({ org }) {
  const contacts = [
    org.website && {
      label: "Website",
      value: (
        <a
          href={org.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 link-accent"
        >
          {hostOf(org.website)}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(mở tab mới)</span>
        </a>
      ),
    },
    org.contactEmail && {
      label: "Email",
      value: (
        <a href={`mailto:${org.contactEmail}`} className="link-quiet">
          {org.contactEmail}
        </a>
      ),
    },
    org.contactPhone && {
      label: "Điện thoại",
      value: (
        <a
          href={`tel:${org.contactPhone.replace(/\s/g, "")}`}
          className="link-quiet tabular-nums"
        >
          {org.contactPhone}
        </a>
      ),
    },
    org.city && { label: "Thành phố", value: org.city },
  ].filter(Boolean);

  if (contacts.length === 0) return null;
  return (
    <motion.dl
      variants={fadeUp}
      className="self-end border-t border-border lg:col-span-4 lg:mt-24"
    >
      {contacts.map((c) => (
        <div
          key={c.label}
          className="grid grid-cols-[110px_1fr] gap-4 border-b border-border py-3.5"
        >
          <dt className="eyebrow pt-0.5">{c.label}</dt>
          <dd className="min-w-0 text-sm break-words text-foreground">
            {c.value}
          </dd>
        </div>
      ))}
    </motion.dl>
  );
}
