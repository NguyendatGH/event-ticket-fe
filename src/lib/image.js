/**
 * Ảnh đúng cỡ: URL Unsplash (images.unsplash.com) → đặt lại w (px), q=75, auto=format để thẻ nhỏ không tải ảnh 1600px.
 * URL khác (ảnh upload /uploads/…, CDN khác) giữ nguyên. URL rỗng → trả nguyên (ImageWithFallback lo ảnh dự phòng).
 *   <ImageWithFallback src={imageAt(event.coverImageUrl, 600)} … />
 */
export function imageAt(url, width) {
  if (!url || !width || !url.startsWith("https://images.unsplash.com/")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(Math.round(width)));
    u.searchParams.set("q", "75");
    u.searchParams.set("auto", "format");
    if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return url;
  }
}
