
export function cardRoutesWithout3ds({ methods, policy, routes, acquirers }) {
  if (!methods.includes("CARD") || policy !== "REQUIRED" || !Array.isArray(acquirers)) return [];
  const card = (routes?.CARD ?? []).map((r) => r.acquirerCode);
  const with3ds = new Set(acquirers.filter((a) => a.threeDsSupported).map((a) => a.code));
  return card.length > 0 && !card.some((code) => with3ds.has(code)) ? card : [];
}

export const PAYMENT_METHODS = ["CARD", "QR", "PAYNOW", "GOOGLE_PAY", "APPLE_PAY"];

export function methodPaths({ methods, policy, routes, bank, acquirers, connections }) {
  const acqs = Array.isArray(acquirers) ? acquirers : null;
  const conns = Array.isArray(connections) ? connections : null;
  return PAYMENT_METHODS.map((method) => {
    const codes = bank ? [bank] : (routes?.[method] ?? []).map((r) => r.acquirerCode);
    const chain = codes.map((code) => {
      const acquirer = acqs ? acqs.find((a) => a.code === code) : undefined;
      const exists = acqs ? Boolean(acquirer) : null;
      const accepts = acqs ? Boolean(acquirer && acquirer.status === "ACTIVE" && (acquirer.paymentMethods ?? []).includes(method)) : null;
      const connected = conns ? conns.some((c) => c.acquirerCode === code && c.status === "ACTIVE") : null;
      const needs3ds = method === "CARD" && policy === "REQUIRED";
      const threeDsOk = !needs3ds ? true : acqs ? Boolean(acquirer?.threeDsSupported) : null;
      const known = accepts !== null && connected !== null && threeDsOk !== null;
      return { code, exists, accepts, connected, threeDsOk, usable: known ? accepts && connected && threeDsOk : null };
    });
    const enabled = (methods ?? []).includes(method);
    const loaded = chain.every((c) => c.usable !== null);
    const visible = chain.length === 0 ? false : loaded ? chain.some((c) => c.usable) : null;
    return { method, enabled, chain, noRoute: chain.length === 0, visible };
  });
}

export const METHOD_LABEL = { CARD: "Thẻ", QR: "QR", PAYNOW: "PayNow", GOOGLE_PAY: "Google Pay", APPLE_PAY: "Apple Pay" };


export function acquirerUsage(profiles) {
  const usage = {};
  for (const p of profiles) {
    for (const [method, rules] of Object.entries(p.routes ?? {})) {
      for (const rule of rules) {
        const list = (usage[rule.acquirerCode] ??= []);
        let entry = list.find((e) => e.profile === p.code);
        if (!entry) { entry = { profile: p.code, methods: [] }; list.push(entry); }
        entry.methods.push(method);
      }
    }
  }
  return usage;
}

export function routeChain({ routes, method, acquirers }) {
  const list = Array.isArray(acquirers) ? acquirers : null;
  const rules = [...(routes?.[method] ?? [])].sort((a, b) => a.priority - b.priority);
  const chain = rules.map((rule) => {
    const acquirer = list?.find((a) => a.code === rule.acquirerCode);
    const problem = !list ? null
      : !acquirer ? "missing"
      : acquirer.status !== "ACTIVE" ? "inactive"
      : !(acquirer.paymentMethods ?? []).includes(method) ? "unsupported"
      : null;
    return { priority: rule.priority, code: rule.acquirerCode, problem };
  });
  return {
    chain,
    nextPriority: rules.reduce((max, r) => Math.max(max, r.priority), 0) + 1,
    usable: chain.some((c) => c.problem === null),
  };
}
