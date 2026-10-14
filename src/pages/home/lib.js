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

export function byStartsAt(events) {
  const time = (e) => (e.startsAt ? Date.parse(e.startsAt) : Number.POSITIVE_INFINITY);
  return [...events].sort((a, b) => time(a) - time(b));
}

export function sectionStatus(queries, count) {
  if (count > 0) return "ready";
  if (queries.some((q) => q.isPending && q.fetchStatus !== "idle")) return "loading";
  if (queries.length > 0 && queries.every((q) => q.isError)) return "error";
  return "empty";
}

export const TILE_ROW = "[--pv:1.25] sm:[--pv:2.2] md:[--pv:3] lg:[--pv:4]";
