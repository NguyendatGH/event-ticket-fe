// Reveal khi cuộn tới (once). Nội dung trên màn hình đầu: truyền `immediate` để chạy ngay khi mount.

import { motion } from "motion/react";
import { fadeUp, inView, riseSm, stagger } from "@/lib/motion";

const trigger = (immediate) => (immediate ? { initial: "hidden", animate: "show" } : inView);

export function RevealGroup({ as = "div", variants = stagger, immediate = false, className, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag {...trigger(immediate)} variants={variants} className={className} {...rest}>
      {children}
    </Tag>
  );
}

export function RevealItem({ as = "div", size = "md", variants, className, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag variants={variants || (size === "sm" ? riseSm : fadeUp)} className={className} {...rest}>
      {children}
    </Tag>
  );
}

export function Reveal({ as = "div", size = "md", variants, immediate = false, className, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag {...trigger(immediate)} variants={variants || (size === "sm" ? riseSm : fadeUp)} className={className} {...rest}>
      {children}
    </Tag>
  );
}
