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
