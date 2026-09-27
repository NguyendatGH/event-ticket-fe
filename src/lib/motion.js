/**
 * Mọi thông số chuyển động của app nằm ở đây (package `motion`, import từ "motion/react").
 * Muốn thêm animation: dùng lại token/variants ở file này, đừng tự đặt số mới trong page.
 *
 * Quy tắc (fe/design-spec.md, mục MOTION): chỉ animate transform/opacity (rẻ cho GPU, không làm
 * nhảy layout); không nảy (spring luôn bounce: 0); exit nhanh hơn enter (≈ 0.6×).
 * App bọc MotionConfig reducedMotion="user" → người bật "giảm chuyển động" chỉ thấy fade tức thì.
 *
 * "Variants" = object đặt tên cho các trạng thái ("hidden", "show"). Cha đặt initial/animate,
 * con chỉ cần variants cùng tên là tự chạy theo, và `stagger` ở cha làm các con hiện lần lượt:
 *   <motion.div variants={stagger} initial="hidden" animate="show">
 *     <motion.div variants={fadeUp}>…</motion.div>
 *   </motion.div>
 *
 * Lưu ý hiệu năng: variants phải là hằng số (khai báo ngoài component). Tạo object mới mỗi lần
 * render làm motion so sánh lại và có thể chạy lại animation.
 */
export const EASE_OUT = [0.16, 1, 0.3, 1]; // out-expo: mọi enter/reveal/count-up
export const EASE_IN = [0.4, 0, 1, 1]; // chỉ cho exit
export const EASE_INOUT = [0.65, 0, 0.35, 1]; // crossfade, wizard slide

/** Giây. */
export const DUR = { press: 0.1, fast: 0.15, base: 0.22, moderate: 0.32, slow: 0.55, slower: 0.8, count: 0.9, drift: 9 };
/** px. */
export const DIST = { xs: 3, sm: 8, md: 16, lg: 24 };
export const SPRING = {
  indicator: { type: "spring", visualDuration: 0.32, bounce: 0 }, // gạch chân tab/nav trượt
  layout: { type: "spring", visualDuration: 0.38, bounce: 0 }, // list thêm/xóa/sắp xếp
  press: { type: "spring", visualDuration: 0.18, bounce: 0 },
};
// Reveal khi cuộn: kích hoạt SỚM (khối còn cách mép dưới 15% màn hình) và chỉ cần chạm mép ("some").
// Ngưỡng cũ (20% khối + lề âm) làm hàng poster cao để trống một đoạn dài khi cuộn tới.
export const VIEWPORT = { once: true, amount: "some", margin: "0px 0px 15% 0px" };
export const HAS_IO = typeof IntersectionObserver !== "undefined";

export const fadeUp = {
  hidden: { opacity: 0, y: DIST.md },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

/** Stagger tùy chỉnh: staggerOf(0.035, 0.08) cho menu, staggerOf(0.08) cho hero. */
export const staggerOf = (each, delay = 0.04) => ({ hidden: {}, show: { transition: { staggerChildren: each, delayChildren: delay } } });

/** Stagger cho khối đầu trang (hero): tiêu đề, meta, nút lần lượt hiện. */
export const heroStagger = staggerOf(0.08, 0.15);

/**
 * Khối xuất hiện khi cuộn tới: <motion.section {...inView} variants={fadeUp}>.
 * Không có IntersectionObserver (trình duyệt cũ) → hiện ngay.
 */
export const inView = HAS_IO ? { initial: "hidden", whileInView: "show", viewport: VIEWPORT } : { initial: "hidden", animate: "show" };

export const riseSm = {
  hidden: { opacity: 0, y: DIST.sm },
  show: { opacity: 1, y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
};

export const heroLine = {
  hidden: { opacity: 0, y: DIST.lg },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT } },
};

/** Ảnh lắng xuống khi mount (cover chi tiết sự kiện). */
export const imageSettle = {
  hidden: { opacity: 0, scale: 1.04 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_OUT } },
};

/** Item lưới: trễ theo vị trí, tối đa 8 item (0.35s). Trang tải thêm: gridItem(i % PAGE_SIZE). */
export const gridItem = (i) => ({
  hidden: { opacity: 0, y: DIST.md },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT, delay: Math.min(i, 7) * 0.05 } },
});

/** Dòng danh sách thêm/xóa (dùng qua AnimatedItem). */
export const rowItem = {
  initial: { opacity: 0, y: DIST.sm },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
  exit: { opacity: 0, x: -DIST.sm, transition: { duration: DUR.base * 0.8, ease: EASE_IN } },
};

/**
 * Thông báo lỗi dưới ô nhập: fade + trượt xuống 4px (không rung). Dùng dạng props trải:
 *   <motion.p key={message} {...messageIn}>{message}</motion.p>
 * `key={message}` để khi đổi nội dung lỗi thì animation chạy lại.
 */
export const messageIn = { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, transition: { duration: DUR.base, ease: EASE_OUT } };

/** Wizard theo hướng: custom = +1 (tới) / -1 (lui). */
export const slideStep = {
  enter: (d) => ({ opacity: 0, x: d * DIST.lg }),
  center: { opacity: 1, x: 0, transition: { duration: DUR.moderate, ease: EASE_OUT } },
  exit: (d) => ({ opacity: 0, x: d * -DIST.lg, transition: { duration: DUR.base * 0.8, ease: EASE_IN } }),
};
