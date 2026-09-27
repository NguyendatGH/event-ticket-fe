/**
 * Hàm thuần cho trang chủ (không gọi API, không JSX). Test: lib.test.js.
 */

/**
 * Gộp nhiều danh sách sự kiện, bỏ trùng theo id, giữ thứ tự xuất hiện đầu tiên.
 * Dùng cho "Sự kiện đặc biệt" (nổi bật + sắp diễn ra) và hàng danh mục gộp 2 danh mục.
 *   mergeEvents([a, b], [b, c]) → [a, b, c]
 */
export function mergeEvents(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const event of list ?? []) {
      if (!event?.id || seen.has(event.id)) continue;
      seen.add(event.id);
      out.push(event);
    }
  }
  return out;
}

/** Sắp theo giờ bắt đầu tăng dần (sự kiện thiếu ngày xếp cuối). Trả mảng mới. */
export function byStartsAt(events) {
  const time = (e) => (e.startsAt ? Date.parse(e.startsAt) : Number.POSITIVE_INFINITY);
  return [...events].sort((a, b) => time(a) - time(b));
}

/**
 * Gom tin bán lại theo sự kiện: mỗi sự kiện giữ tin rẻ nhất + đếm số tin còn lại,
 * để trang chủ không hiện nhiều thẻ giống hệt nhau của cùng một sự kiện.
 * → [{ listing, others }]
 */
export function cheapestPerEvent(listings) {
  const byEvent = new Map();
  for (const listing of listings) {
    const key = listing.event?.id ?? listing.id;
    const group = byEvent.get(key);
    if (!group) {
      byEvent.set(key, { listing, others: 0 });
    } else {
      group.others += 1;
      if (Number(listing.price) < Number(group.listing.price)) group.listing = listing;
    }
  }
  return [...byEvent.values()];
}

/**
 * Trạng thái hiển thị của một section từ một hoặc nhiều query TanStack:
 *   "loading"  còn query đang tải lần đầu và chưa có dữ liệu nào để hiện
 *   "error"    mọi query đều lỗi (một query lỗi mà query khác có dữ liệu thì vẫn hiện phần có)
 *   "empty"    tải xong, không có mục nào → section ẩn
 *   "ready"    có dữ liệu
 * `count` = số mục sẽ hiện (sau khi gộp/lọc).
 */
export function sectionStatus(queries, count) {
  if (count > 0) return "ready";
  if (queries.some((q) => q.isPending && q.fetchStatus !== "idle")) return "loading";
  if (queries.length > 0 && queries.every((q) => q.isError)) return "error";
  return "empty";
}
