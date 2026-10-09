export const SERVICE_FEE = 12000;

export function tierLimit(tier) {
  const maxPerOrder = Number(tier?.maxPerOrder ?? 10);
  const available = Number(tier?.available ?? 0);
  return Math.max(0, Math.min(maxPerOrder, available));
}
